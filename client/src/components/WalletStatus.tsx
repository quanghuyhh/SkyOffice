import {useWeb3React} from '@web3-react/core';
import {ethers} from 'ethers';
import {ReactElement, useEffect, useState} from 'react';
import styled from 'styled-components';
import {Provider} from '../utils/provider';

type CleanupFunction = (() => void) | undefined;

const StyledWalletStatusDiv = styled.div`
  display: block;
  position: fixed;
  bottom: 80px;
  right: 15px;
  background: #e0e0e0;
  padding: 10px;
  border: #3a3a50 solid 2px;
  border-radius: 5px;
  z-index: 9999
`;

const StyledStatusIcon = styled.h1`
  margin: 0px;
`;

function Account(): ReactElement {
  const {account} = useWeb3React<Provider>();

  return (
    <>
      <span>
        <strong>Account:</strong>
        <div>
          {typeof account === 'undefined'
            ? ''
            : account
          }
        </div>
      </span>
    </>
  );
}

function Balance(): ReactElement {
  const {account, library, chainId} = useWeb3React<Provider>();

  const [balance, setBalance] = useState<ethers.BigNumber>();

  useEffect((): CleanupFunction => {
    if (typeof account === 'undefined' || account === null || !library) {
      return;
    }

    let stale = false;

    async function getBalance(
      library: Provider,
      account: string
    ): Promise<void> {
      const balance: ethers.BigNumber = await library.getBalance(account);

      try {
        if (!stale) {
          setBalance(balance);
        }
      } catch (error: any) {
        if (!stale) {
          setBalance(undefined);

          window.alert(
            'Error!' + (error && error.message ? `\n\n${error.message}` : '')
          );
        }
      }
    }

    getBalance(library, account);

    // create a named balancer handler function to fetch the balance each block. in the
    // cleanup function use the fucntion name to remove the listener
    const getBalanceHandler = (): void => {
      getBalance(library, account);
    };

    library.on('block', getBalanceHandler);

    // cleanup function
    return (): void => {
      stale = true;
      library.removeListener('block', getBalanceHandler);
      setBalance(undefined);
    };
  }, [account, library, chainId]); // ensures refresh if referential identity of library doesn't change across chainIds

  const formatterBalancer = balance === null
    ? 'Error'
    : balance
      ? `${Math.round(+ethers.utils.formatEther(balance) * 1e4) / 1e4}`
      : ''
  return (
    <>
      <span>
        <strong>Balance</strong>
        <div>
          💰
          {formatterBalancer}
        </div>
      </span>
    </>
  );
}

export function WalletStatus(): ReactElement {
  return (
    <StyledWalletStatusDiv>
      <div>
        <Account/>
        <Balance/>
      </div>
    </StyledWalletStatusDiv>
  );
}

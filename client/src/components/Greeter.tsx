import { useWeb3React } from '@web3-react/core';
import { Contract, ethers, Signer } from 'ethers';
import {
  ChangeEvent,
  MouseEvent,
  ReactElement,
  useEffect,
  useState
} from 'react';
import styled from 'styled-components';
import GreeterArtifact from '../artifacts/contracts/Greeter.sol/Greeter.json';
import { Provider } from '../utils/provider';

const SectionDivider = styled.div`
  border-top: 2px solid #3a3a50;
  grid-column: 1 / 1;
  margin: 10px 0;
`;

const StyledDeployContractButton = styled.button`
  width: 180px;
  height: 2rem;
  cursor: pointer;
  place-self: center;
  border: solid 2px #3a3a50;
  background: #91a5cf;
  color: #f8f8f8;
`;

const StyledGreetingDiv = styled.div`
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
  grid-template-columns: 135px 2.7fr 1fr;
  grid-gap: 10px;
  place-self: center;
  align-items: center;
`;

const StyledLabel = styled.label`
  font-weight: bold;
  color: #3a3a50;
`;

const StyledContent = styled.div`
  font-weight: bold;
  color: #dbae6c;
`;

const StyledPlaceHolder = styled.em`
  color: #aeaeae;
`

const StyledInput = styled.input`
  padding: 0.4rem 0.6rem;
  line-height: 2fr;
  border: solid 2px #3a3a50;
  color: #3a3a50;
  outline: none;
`;

const StyledButton = styled.button`
  width: 150px;
  line-height: 2fr;
  border: solid 2px #3a3a50;
  cursor: pointer;
  background: #42eacb;
  padding: 0.4rem 0.6rem;
  color: #091e1a;
  font-weight: bold;
  text-transform: uppercase;
  min-height: 2.4rem;
`;

const StyleProcessing = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  
  .dot-flashing {
    position: relative;
    width: 10px;
    height: 10px;
    background-color: #091e1a;
    color: #091e1a;
    animation: dotFlashing 1s infinite linear alternate;
    animation-delay: .5s;
  }

  .dot-flashing::before, .dot-flashing::after {
    content: '';
    display: inline-block;
    position: absolute;
    top: 0;
  }

  .dot-flashing::before {
    left: -15px;
    width: 10px;
    height: 10px;
    background-color: #091e1a;
    color: #091e1a;
    animation: dotFlashing 1s infinite alternate;
    animation-delay: 0s;
  }

  .dot-flashing::after {
    left: 15px;
    width: 10px;
    height: 10px;
    background-color: #091e1a;
    color: #091e1a;
    animation: dotFlashing 1s infinite alternate;
    animation-delay: 1s;
  }

  @keyframes dotFlashing {
    0% {
      background-color: #091e1a;
    }
    50%,
    100% {
      background-color: #dbae6c;
    }
  }
`

function Processing(): ReactElement {
  return <StyleProcessing><div className="dot-flashing"></div></StyleProcessing>
}

export function Greeter(): ReactElement {
  const context = useWeb3React<Provider>();
  const { library, active } = context;

  const [signer, setSigner] = useState<Signer>();
  const [greeterContract, setGreeterContract] = useState<Contract>();
  const [greeterContractAddr, setGreeterContractAddr] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('');
  const [greetingInput, setGreetingInput] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);
  const [inputProcessing, setInputProcessing] = useState<boolean>(false);

  useEffect((): void => {
    if (!library) {
      setSigner(undefined);
      return;
    }

    setSigner(library.getSigner());
  }, [library]);

  useEffect((): void => {
    if (!greeterContract) {
      return;
    }

    async function getGreeting(greeterContract: Contract): Promise<void> {
      const _greeting = await greeterContract.greet();

      if (_greeting !== greeting) {
        setGreeting(_greeting);
      }
    }

    getGreeting(greeterContract);
  }, [greeterContract, greeting]);

  function handleDeployContract(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    // only deploy the Greeter contract one time, when a signer is defined
    if (greeterContract || !signer) {
      return;
    }

    async function deployGreeterContract(signer: Signer): Promise<void> {
      const Greeter = new ethers.ContractFactory(
        GreeterArtifact.abi,
        GreeterArtifact.bytecode,
        signer
      );

      try {
        setProcessing(true)
        const greeterContract = await Greeter.deploy('Hello, Hardhat!');

        await greeterContract.deployed();

        const greeting = await greeterContract.greet();

        setGreeterContract(greeterContract);
        setGreeting(greeting);

        window.alert(`Greeter deployed to: ${greeterContract.address}`);

        setGreeterContractAddr(greeterContract.address);
      } catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      }
      finally {
        setProcessing(false)
      }
    }

    deployGreeterContract(signer);
  }

  function handleGreetingChange(event: ChangeEvent<HTMLInputElement>): void {
    event.preventDefault();
    setGreetingInput(event.target.value);
  }

  function handleGreetingSubmit(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    if (!greeterContract) {
      window.alert('Undefined greeterContract');
      return;
    }

    if (!greetingInput) {
      window.alert('Greeting cannot be empty');
      return;
    }

    async function submitGreeting(greeterContract: Contract): Promise<void> {
      try {
        setInputProcessing(true)
        const setGreetingTxn = await greeterContract.setGreeting(greetingInput);

        await setGreetingTxn.wait();

        const newGreeting = await greeterContract.greet();
        window.alert(`Success!\n\nGreeting is now: ${newGreeting}`);

        if (newGreeting !== greeting) {
          setGreeting(newGreeting);
        }
      } catch (error: any) {
        window.alert(
          'Error!' + (error && error.message ? `\n\n${error.message}` : '')
        );
      } finally {
        setInputProcessing(false)
        setGreetingInput('')
      }
    }

    submitGreeting(greeterContract);
  }

  return (
    <>
      <StyledDeployContractButton
        disabled={!active || greeterContract ? true : false}
        style={{
          cursor: !active || greeterContract || processing ? 'not-allowed' : 'pointer',
          backgroundColor: !active || greeterContract ? '#c78c59' : '#91a5cf'
        }}
        onClick={handleDeployContract}
      >
        {!active || greeterContract ? 'Contract was deployed' : processing ? <Processing /> : 'Deploy Greeter Contract'}
      </StyledDeployContractButton>
      <SectionDivider />
      <StyledGreetingDiv>
        <StyledLabel>Contract addr</StyledLabel>
        <StyledContent>
          {greeterContractAddr ? (
            greeterContractAddr
          ) : (
            <StyledPlaceHolder>{`<Contract not yet deployed>`}</StyledPlaceHolder>
          )}
        </StyledContent>
        {/* empty placeholder div below to provide empty first row, 3rd col div for a 2x3 grid */}
        <div></div>
        <StyledLabel>Current greeting</StyledLabel>
        <StyledContent>
          {greeting ? greeting : <StyledPlaceHolder>{`<Contract not yet deployed>`}</StyledPlaceHolder>}
        </StyledContent>
        {/* empty placeholder div below to provide empty first row, 3rd col div for a 2x3 grid */}
        <div></div>
        <StyledLabel htmlFor="greetingInput">Set new greeting</StyledLabel>
        <StyledInput
          id="greetingInput"
          type="text"
          placeholder={greeting ? '' : '<Contract not yet deployed>'}
          onChange={handleGreetingChange}
          value={greetingInput}
          style={{ fontStyle: greeting ? 'normal' : 'italic' }}
        ></StyledInput>
        <StyledButton
          disabled={!active || !greeterContract ? true : false}
          style={{
            cursor: !active || !greeterContract || inputProcessing ? 'not-allowed' : 'pointer'
          }}
          onClick={handleGreetingSubmit}
        >
          {inputProcessing ? <Processing /> : 'Submit'}
        </StyledButton>
        <div></div>
      </StyledGreetingDiv>
    </>
  );
}

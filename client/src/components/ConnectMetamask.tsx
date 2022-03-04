import React, {MouseEvent, ReactElement} from "react";
import {useWeb3React} from "@web3-react/core";
import {Provider} from "../utils/provider";
import {useAppDispatch, useAppSelector} from "../hooks";
import store from "../stores";
import {setActivating, setAvatarIndex, setLoggedIn, setPlayerName} from "../stores/UserStore";
import {injected} from "../utils/connectors";
import phaserGame from "../PhaserGame";
import Bootstrap from "../scenes/Bootstrap";
import Game from "../scenes/Game";
import {useEagerConnect, useInactiveListener} from "../utils/hooks";
import Button from "@mui/material/Button";
import {AbstractConnector} from "@web3-react/abstract-connector";

type ActivateFunction = (
  connector: AbstractConnector,
  onError?: (error: Error) => void,
  throwErrors?: boolean
) => Promise<void>;

const avatars = ['adam', 'ash', 'lucy', 'nancy',]

function ButtonConnectMetamask(): ReactElement {
  const context = useWeb3React<Provider>();
  const {activate, active, account} = context;

  const playerName = useAppSelector((state) => state.user.playerName)
  const avatarIndex = useAppSelector((state) => state.user.avatarIndex)
  const activating = useAppSelector((state) => state.user.activating)
  const dispatch = useAppDispatch()
  const lobbyJoined = useAppSelector((state) => state.room.lobbyJoined)

  async function _activate(activate: ActivateFunction): Promise<void> {
    store.dispatch(setActivating(true))
    await activate(injected);
    store.dispatch(setActivating(false))

    // set player information
    const name = (typeof account === 'undefined' || !account ? 'undefined' : `${account.substring(0, 6)}...${account.substring(account.length - 4)}`)
    const avatarIndex = Math.floor(Math.random() * 3)
    store.dispatch(setPlayerName(name))
    store.dispatch(setAvatarIndex(avatarIndex))

    if (lobbyJoined) {
      const bootstrap = phaserGame.scene.keys.bootstrap as Bootstrap
      bootstrap.network
        .joinOrCreatePublic()
        .then(() => bootstrap.startGame())
        .then(
          () => setTimeout(() => {
            const game = phaserGame.scene.keys.game as Game
            game.registerKeys()
            game.myPlayer.setPlayerName(name)
            game.myPlayer.setPlayerTexture(avatars[avatarIndex])
            game.network.readyToConnect()
            dispatch(setLoggedIn(true))
          }, 500)
        )
        .catch((error) => console.error(error))
    }
  }

  function handleActivate(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();

    _activate(activate);
  }

  // handle logic to eagerly connect to the injected ethereum provider, if it exists and has
  // granted access already
  const eagerConnectionSuccessful = useEagerConnect();

  // handle logic to connect in reaction to certain events on the injected ethereum provider,
  // if it exists
  useInactiveListener(!eagerConnectionSuccessful);

  return (
    <Button variant="contained" color="secondary" onClick={handleActivate}>
      Connect to metamask
    </Button>
  );
}

export function ConnectMetamask(): ReactElement {
  return (
    <ButtonConnectMetamask/>
  );
}
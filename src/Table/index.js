import React, { useEffect, useState, useContext, createContext } from "react";
import Body from "./Body";
import Actions from "../Actions";
import Players from "./Players";
import Info from "./Info";
import "./styles.scss";
import useTable from "./use-table";
import usePlayers from "./use-players";
import { AppContext } from "../App";
import { addHandler } from "../App/reducer";
import { Helmet } from "react-helmet";

const PLAY_NOTIFY_SOUND = "PLAY_NOTIFY_SOUND";

addHandler(PLAY_NOTIFY_SOUND, (action, { alerts }) => {
  if (alerts) {
    const audioElement = document.getElementById("notify");
    audioElement.play();
  }
});

export const TableContext = createContext();

function Table({ match }) {
  const { tableId } = match.params;
  let { profileHash, dispatch } = useContext(AppContext);
  const [coordinates, setCoordinates] = useState({});

  const [table = { maxPlayers: 7 }, loadingTable] = useTable(tableId);
  const [players, me, loadingPlayers] = usePlayers(tableId, profileHash);
  const [error, setError] = useState("");
  const [savedPlayersCount, savePlayresCount] = useState(10);

  const playersCount = Object.keys(players).length;

  const maxBet = Math.max(
    0,
    ...Object.values(players).map(({ bet }) => bet || 0)
  );

  const betSum = Object.values(players).reduce((sum, p) => sum + p.bet || 0, 0);

  const showError = error => {
    // show the error
    setError(error);
  };

  useEffect(() => {
    if (loadingPlayers) {
      return;
    }
    if (playersCount > savedPlayersCount) {
      dispatch({
        type: PLAY_NOTIFY_SOUND
      });
    }
    savePlayresCount(playersCount);
  }, [loadingPlayers, playersCount, savedPlayersCount, dispatch]);

  useEffect(() => {
    window.onresize = () => {
      let co = {};
      let rect;

      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, "center"].forEach(i => {
        let element = document.getElementById(`position-${i}`);
        if (element) {
          rect = element.getBoundingClientRect();
          co[i] = [Math.round(rect.x), Math.round(rect.y)];
        }
      });
      setCoordinates(co);
    };
    window.onresize();
  }, [loadingTable]);

  return (
    <TableContext.Provider
      value={{
        ...table,
        tableId,
        players,
        me,
        coordinates,
        maxBet,
        betSum,
        showError
      }}
    >
      <Helmet>
        <title>{`${process.env.REACT_APP_TABLE_TITLE} ${table.title}`}</title>
      </Helmet>
      <div className="table">
        {!loadingTable && (
          <>
            <Body playersCount={Math.max(8, table.maxPlayers)} />
            <Info />
            <Players />
          </>
        )}
        <Actions />
        {error && (
          <div
            className="error"
            onClick={() => {
              setError("");
            }}
          >
            <div>{error}</div>
          </div>
        )}
      </div>
    </TableContext.Provider>
  );
}

export default Table;

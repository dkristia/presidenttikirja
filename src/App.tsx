import { useState, useEffect } from 'react';
import people from './data/namedata.json';
import kysymykset from './data/kysymykset.json';

interface Person {
  name: string;
  image: string;
}

type EloType = {
  [key: string]: {
    [key: string]: number;
  };
};

function App() {

  // Add a new state variable to keep track of expanded boxes
  const [expandedBoxes, setExpandedBoxes] = useState<Record<string, boolean>>({});

  // Function to toggle a box's expanded state
  const toggleBox = (box: string) => {
    setExpandedBoxes(prevState => ({ ...prevState, [box]: !prevState[box] }));
  };

  const [randomPerson1, setRandomPerson1] = useState<Person | null>(null);
  const [randomPerson2, setRandomPerson2] = useState<Person | null>(null);
  const [question, setQuestion] = useState('');
  const [elo, setElo] = useState<EloType>({ "Jotain meni pieleen": { "Servu vrm pois päältä": 6969, "Tai joku muu tuubakoodi": 6969 } });
  const [isMain, setIsMain] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);


  useEffect(() => {
    getRandomPerson();
    sendToServer({ 'winner': 'get-elo-only', 'loser': 'get-elo-only', 'question': 'get-elo-only' });
  }, []);

  const getRandomPerson = () => {
    const randomIndex1 = Math.floor(Math.random() * people.length);
    const person1 = people[randomIndex1];

    let list = people.filter((person) => person.name !== person1.name);

    const randomIndex2 = Math.floor(Math.random() * list.length);
    const person2 = list[randomIndex2];

    setRandomPerson1(person1);
    setRandomPerson2(person2);
    setQuestion(kysymykset[Math.floor(Math.random() * kysymykset.length)][0]);
  };

  const sendToServer = async (data: any) => {
    try {
      const response = await fetch('backend/receive-data/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error('Failed to send data to the server');
      }

      const json = await response.json();
      const gotElo: EloType = json.elo;
      let sortedEloList: EloType = {}
      for (const statQuestion of Object.keys(gotElo)) {
        sortedEloList[statQuestion] = Object.fromEntries(Object.entries(gotElo[statQuestion]).sort(([, a], [, b]) => b - a));
      }
      setElo(sortedEloList);

    } catch (error) {
      console.error('Error:', error);
    }
  };

  const choosePerson = (is1: boolean) => {
    sendToServer({ 'winner': is1 ? randomPerson1?.name : randomPerson2?.name, 'loser': is1 ? randomPerson2?.name : randomPerson1?.name, 'question': question });
    getRandomPerson();

    setIsDisabled(true);
    setTimeout(() => {
      setIsDisabled(false);
    }, 3 * 1000);
  }

  return (
    <div className="App">
      <button onClick={() => setIsMain(!isMain)}>{isMain ? "Stats" : "Takaisin"}</button>
      <h1>Presidenttikirja</h1>
      {isMain &&
        <>
          <h2>{question}</h2>
          <h3>Valitse parempi ehdokas tähän kriteeriin</h3>
          <div className='pair-container'>
            <button disabled={isDisabled} className='person' onClick={() => choosePerson(true)}>
              <h2>{randomPerson1?.name}</h2>
              <img src={'./images/' + randomPerson1?.image} alt={randomPerson1?.name} />
            </button>
            <button disabled={isDisabled} className='person' onClick={() => choosePerson(false)}>
              <h2>{randomPerson2?.name}</h2>
              <img src={'./images/' + randomPerson2?.image} alt={randomPerson2?.name} />
            </button>
          </div>
        </>
      }
      {!isMain &&
        <>
          <h2>Stats</h2>
          {Object.keys(elo).map((statQuestion) => (
            <div className='statlist'>
              <h1>{Object.fromEntries(kysymykset)[statQuestion] || 'Keskimääräisesti paras presidentti'}</h1>
              <ul>
                {Object.keys(elo[statQuestion]).slice(0, expandedBoxes[statQuestion] ? undefined : 3).map((person, index) => (
                  <li className='stat-item' key={`${person.replace(' ', '-')}-${index}`}>
                    <img src={'./images/' + people.find(p => p.name === person)?.image} alt={person} className='stat-image' />
                    <div style={{ flexGrow: 1, fontSize: 24 }}>{person}: {Math.round(elo[statQuestion][person])}</div>
                  </li>
                ))}
              </ul>
              {Object.keys(elo[statQuestion]).length > 3 && (
                <button onClick={() => toggleBox(statQuestion)}>
                  {expandedBoxes[statQuestion] ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          ))}
        </>
      }

    </div>
  );
}

export default App;

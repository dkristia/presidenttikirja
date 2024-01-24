import { useState, useEffect } from 'react';
import people from './data/namedata.json';
import kysymykset from './data/kysymykset.json';

interface Person {
  name: string;
  image: string;
}

function App() {

  const [randomPerson1, setRandomPerson1] = useState<Person | null>(null);
  const [randomPerson2, setRandomPerson2] = useState<Person | null>(null);
  const [question, setQuestion] = useState('');

  useEffect(() => {
    getRandomPerson();
  }, []);

  const getRandomPerson = () => {
    const randomIndex1 = Math.floor(Math.random() * people.length);
    const person1 = people[randomIndex1];

    let list = people.filter((person) => person.name !== person1.name);

    const randomIndex2 = Math.floor(Math.random() * list.length);
    const person2 = list[randomIndex2];

    setRandomPerson1(person1);
    setRandomPerson2(person2);
    setQuestion(kysymykset[Math.floor(Math.random() * kysymykset.length)]);
  };

  useEffect(() => {
    if (randomPerson1 && randomPerson2) {
      // The state has been updated, now you can proceed
      console.log('Random persons:', randomPerson1, randomPerson2);
    }
  }, [randomPerson1, randomPerson2]);


  const sendToServer = async (data: any) => {
    try {
      const response = await fetch('https://9dde-193-211-37-15.ngrok-free.app/receive-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log('Data sent successfully!');
      } else {
        console.error('Failed to send data to the server');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const choosePerson = (is1: boolean) => {
    sendToServer({ 'winner': is1 ? randomPerson1?.name : randomPerson2?.name, 'loser': is1 ? randomPerson2?.name : randomPerson1?.name, 'question': question });
    getRandomPerson();
  }

  return (
    <div className="App">
      <h1>Presidenttikirja</h1>
      <h2>{question}</h2>
      <div className='pair-container'>
        <button className='person' onClick={() => choosePerson(true)}>
          <h2>{randomPerson1?.name}</h2>
          <img src={'/images/' + randomPerson1?.image} alt={randomPerson1?.name} />
        </button>
        <button className='person' onClick={() => choosePerson(false)}>
          <h2>{randomPerson2?.name}</h2>
          <img src={'/images/' + randomPerson2?.image} alt={randomPerson2?.name} />
        </button>
      </div>
    </div>
  );
}

export default App;

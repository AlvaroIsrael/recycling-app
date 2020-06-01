import express from 'express';

const app = express();

app.get('/users', (request, response) => {
  console.log('Listagem de usuarios');

  response.status(200).json(['alvaro', 'robson']);
});

app.listen(3333);

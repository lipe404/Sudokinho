const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/jogo', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const RecordSchema = new mongoose.Schema({
  nome: String,
  tempo: Number,
  data: { type: Date, default: Date.now }
});

const Record = mongoose.model('Record', RecordSchema);

app.post('/salvar-tempo', async (req, res) => {
  const { nome, tempo } = req.body;
  const novo = new Record({ nome, tempo });
  await novo.save();
  res.json({ mensagem: 'Tempo salvo!' });
});

app.get('/rank', async (req, res) => {
  const records = await Record.find().sort({ tempo: 1 }).limit(10);
  res.json(records);
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});

# 🧩 Sudokinho

Sudokinho é um jogo de Sudoku minimalista e interativo desenvolvido em **HTML5, CSS3 e JavaScript**. Ideal para quem curte um bom desafio de lógica, com visual limpo, jogabilidade fluida e pensado para desktop e mobile.

---

## 🚀 Demonstração

👉 [Jogue agora!]([https://seulink.com/sudokinho](https://lipe404.github.io/Sudokinho/)) 

---

## 🕹️ Como Jogar

1. Escolha um nível de dificuldade (Fácil, Médio, Difícil).
2. Clique em uma célula vazia para preenchê-la com um número de 1 a 9.
3. Evite repetições na mesma linha, coluna e subgrade 3x3.
4. Use as ferramentas de ajuda se quiser:
   - Apagar número
   - Mostrar dicas
   - Resolver automaticamente

---

## 📦 Tecnologias Utilizadas

- **HTML5** – estrutura semântica da interface
- **CSS3** – estilização responsiva com Grid e animações
- **JavaScript (ES6+)** – lógica do jogo, geração e validação dos tabuleiros

---

# ✨ Funcionalidades

- ✅ Geração de tabuleiros jogáveis
- 🧩 Validação de regras do Sudoku (linhas, colunas e blocos 3x3)
- 🧠 Níveis de dificuldade ajustáveis *(fácil, médio, difícil — em breve!)*
- 💡 Dicas e sistema de verificação de erros *(em desenvolvimento)*
- 📱 Interface responsiva para desktop e mobile
- 🎨 Visual clean e agradável
- 💾 Modularização do código (JS separado por responsabilidades)

- --

# PRÓXIMAS ATUALIZAÇÕES

.VALIDAÇÃO EM TEMPO REAL

    Destacar conflitos imediatamente (números repetidos na linha/coluna/quadrante)
    Células com erro ficam vermelhas
    Contador de erros na tela

.SISTEMAS DE PONTOS
 // Exemplo de sistema de pontuação
const scoring = {
  cellCompleted: 10,
  rowCompleted: 50,
  columnCompleted: 50,
  quadrantCompleted: 75,
  gameCompleted: 500,
  timeBonus: Math.max(0, 1000 - seconds),
  difficultyMultiplier: {
    easy: 1.0,
    medium: 1.5,
    hard: 2.0,
    expert: 3.0
  }
}

Ranking e Estatísticas 📊
    Melhor tempo por dificuldade
    Total de jogos completados
    Taxa de acerto
    Streak (jogos consecutivos completados)
    Gráfico de progresso semanal/mensal

TEMAS
  const themes = {
  classic: { primary: '#333', secondary: '#fff', accent: '#8436c7' },
  dark: { primary: '#1a1a1a', secondary: '#2d2d2d', accent: '#bb86fc' },
  ocean: { primary: '#0077be', secondary: '#87ceeb', accent: '#00bfff' },
  forest: { primary: '#228b22', secondary: '#90ee90', accent: '#32cd32' },
  sunset: { primary: '#ff4500', secondary: '#ffa500', accent: '#ff6347' }
}


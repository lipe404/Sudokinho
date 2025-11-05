/**
 * Sistema de Conquistas/Achievements
 * @class AchievementsSystem
 */
export class AchievementsSystem {
  constructor() {
    this.achievements = [
      {
        id: 'first_win',
        name: 'Primeira Vitória',
        description: 'Complete seu primeiro Sudoku',
        icon: '🏆',
        category: 'progress'
      },
      {
        id: 'speed_10min',
        name: 'Corredor',
        description: 'Complete em menos de 10 minutos',
        icon: '⚡',
        category: 'speed',
        timeLimit: 600 // 10 minutos em segundos
      },
      {
        id: 'speed_5min',
        name: 'Velocista',
        description: 'Complete em menos de 5 minutos',
        icon: '🚀',
        category: 'speed',
        timeLimit: 300 // 5 minutos em segundos
      },
      {
        id: 'speed_4min',
        name: 'Relâmpago',
        description: 'Complete em menos de 4 minutos',
        icon: '⚡',
        category: 'speed',
        timeLimit: 240 // 4 minutos em segundos
      },
      {
        id: 'speed_3min',
        name: 'Raio',
        description: 'Complete em menos de 3 minutos',
        icon: '💨',
        category: 'speed',
        timeLimit: 180 // 3 minutos em segundos
      },
      {
        id: 'speed_2min',
        name: 'Supersônico',
        description: 'Complete em menos de 2 minutos',
        icon: '🌟',
        category: 'speed',
        timeLimit: 120 // 2 minutos em segundos
      },
      {
        id: 'speed_1min',
        name: 'Lenda da Velocidade',
        description: 'Complete em menos de 1 minuto',
        icon: '👑',
        category: 'speed',
        timeLimit: 60 // 1 minuto em segundos
      },
      {
        id: 'perfectionist',
        name: 'Perfeccionista',
        description: 'Complete sem erros',
        icon: '✨',
        category: 'skill'
      },
      {
        id: 'no_hints',
        name: 'Independente',
        description: 'Complete sem usar dicas',
        icon: '🧠',
        category: 'skill'
      }
    ];

    this.unlockedAchievements = this.loadUnlockedAchievements();
  }

  /**
   * Carrega conquistas desbloqueadas do localStorage
   * @returns {Set<string>} Set com IDs das conquistas desbloqueadas
   */
  loadUnlockedAchievements() {
    try {
      const saved = localStorage.getItem('sudokinho_achievements');
      if (saved) {
        return new Set(JSON.parse(saved));
      }
      return new Set();
    } catch (error) {
      console.error('Erro ao carregar conquistas:', error);
      return new Set();
    }
  }

  /**
   * Salva conquistas desbloqueadas no localStorage
   */
  saveUnlockedAchievements() {
    try {
      localStorage.setItem('sudokinho_achievements', JSON.stringify(Array.from(this.unlockedAchievements)));
    } catch (error) {
      console.error('Erro ao salvar conquistas:', error);
    }
  }

  /**
   * Verifica se uma conquista está desbloqueada
   * @param {string} achievementId - ID da conquista
   * @returns {boolean}
   */
  isUnlocked(achievementId) {
    return this.unlockedAchievements.has(achievementId);
  }

  /**
   * Desbloqueia uma conquista
   * @param {string} achievementId - ID da conquista
   * @returns {boolean} True se foi desbloqueada (nova), False se já estava desbloqueada
   */
  unlockAchievement(achievementId) {
    if (!this.unlockedAchievements.has(achievementId)) {
      this.unlockedAchievements.add(achievementId);
      this.saveUnlockedAchievements();
      return true; // Nova conquista
    }
    return false; // Já estava desbloqueada
  }

  /**
   * Obtém uma conquista pelo ID
   * @param {string} achievementId - ID da conquista
   * @returns {Object|null}
   */
  getAchievement(achievementId) {
    return this.achievements.find(a => a.id === achievementId) || null;
  }

  /**
   * Verifica e desbloqueia conquistas baseado nos dados do jogo
   * @param {Object} gameData - Dados do jogo completado
   * @returns {Array<Object>} Array de conquistas recém-desbloqueadas
   */
  checkAchievements(gameData) {
    const newlyUnlocked = [];

    try {
      const { time, errors, hintsUsed, isFirstWin } = gameData;

      // Primeira Vitória
      if (isFirstWin && !this.isUnlocked('first_win')) {
        if (this.unlockAchievement('first_win')) {
          newlyUnlocked.push(this.getAchievement('first_win'));
        }
      }

      // Conquistas de Velocidade (verificar da mais difícil para a mais fácil)
      const speedAchievements = [
        { id: 'speed_1min', time: 60 },
        { id: 'speed_2min', time: 120 },
        { id: 'speed_3min', time: 180 },
        { id: 'speed_4min', time: 240 },
        { id: 'speed_5min', time: 300 },
        { id: 'speed_10min', time: 600 }
      ];

      for (const achievement of speedAchievements) {
        if (time <= achievement.time && !this.isUnlocked(achievement.id)) {
          if (this.unlockAchievement(achievement.id)) {
            newlyUnlocked.push(this.getAchievement(achievement.id));
          }
        }
      }

      // Perfeccionista (sem erros)
      if (errors === 0 && !this.isUnlocked('perfectionist')) {
        if (this.unlockAchievement('perfectionist')) {
          newlyUnlocked.push(this.getAchievement('perfectionist'));
        }
      }

      // Independente (sem dicas)
      if (hintsUsed === 0 && !this.isUnlocked('no_hints')) {
        if (this.unlockAchievement('no_hints')) {
          newlyUnlocked.push(this.getAchievement('no_hints'));
        }
      }

      return newlyUnlocked;
    } catch (error) {
      console.error('Erro ao verificar conquistas:', error);
      return newlyUnlocked;
    }
  }

  /**
   * Obtém todas as conquistas com status de desbloqueio
   * @returns {Array<Object>}
   */
  getAllAchievementsWithStatus() {
    return this.achievements.map(achievement => ({
      ...achievement,
      unlocked: this.isUnlocked(achievement.id)
    }));
  }

  /**
   * Obtém estatísticas de conquistas
   * @returns {Object}
   */
  getStats() {
    const total = this.achievements.length;
    const unlocked = this.unlockedAchievements.size;
    const progress = total > 0 ? Math.round((unlocked / total) * 100) : 0;

    const byCategory = {};
    this.achievements.forEach(achievement => {
      if (!byCategory[achievement.category]) {
        byCategory[achievement.category] = { total: 0, unlocked: 0 };
      }
      byCategory[achievement.category].total++;
      if (this.isUnlocked(achievement.id)) {
        byCategory[achievement.category].unlocked++;
      }
    });

    return {
      total,
      unlocked,
      progress,
      byCategory
    };
  }

  /**
   * Reseta todas as conquistas (para testes)
   */
  resetAchievements() {
    this.unlockedAchievements.clear();
    this.saveUnlockedAchievements();
  }
}


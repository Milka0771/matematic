import { MathSolver } from './MathSolver';

/**
 * Фабрика для создания и выбора подходящего решателя математических задач
 */
export class SolverFactory {
  private solvers: MathSolver[] = [];
  
  /**
   * Конструктор фабрики решателей
   * Регистрирует все доступные решатели
   */
  constructor() {
    // Решатели будут добавлены по мере их реализации
    // this.solvers.push(new AlgebraicSolver());
    // this.solvers.push(new CalculationSolver());
  }
  
  /**
   * Регистрирует новый решатель в фабрике
   * @param solver Экземпляр решателя для регистрации
   */
  registerSolver(solver: MathSolver): void {
    this.solvers.push(solver);
  }
  
  /**
   * Находит подходящий решатель для данного математического выражения
   * @param input Входная строка с математическим выражением
   * @returns Подходящий решатель или null, если такой не найден
   */
  getSolverForInput(input: string): MathSolver | null {
    for (const solver of this.solvers) {
      if (solver.canSolve(input)) {
        return solver;
      }
    }
    return null;
  }
  
  /**
   * Возвращает список всех зарегистрированных решателей
   * @returns Массив всех решателей
   */
  getAllSolvers(): MathSolver[] {
    return [...this.solvers];
  }
  
  /**
   * Возвращает список типов всех зарегистрированных решателей
   * @returns Массив строк с типами решателей
   */
  getSolverTypes(): string[] {
    return this.solvers.map(solver => solver.getType());
  }
}
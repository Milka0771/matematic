/**
 * Интерфейс для представления одного шага решения математической задачи
 */
export interface SolutionStep {
  description: string;  // Описание шага
  formula: string;      // Формула в формате LaTeX
  explanation: string;  // Подробное объяснение
  detailedExplanation?: string; // Дополнительное объяснение (по запросу)
}

/**
 * Интерфейс для данных визуализации
 */
export interface VisualizationData {
  type: 'function-graph' | 'bar-chart' | 'pie-chart';  // Тип визуализации
  expression?: string;                                 // Выражение для графика функции
  variable?: string;                                   // Переменная в функции
  xRange?: [number, number];                           // Диапазон значений по оси X
  solutionPoints?: number[];                           // Точки решения (для уравнений)
  data?: Array<{ label: string; value: number }>;      // Данные для диаграмм
}

/**
 * Интерфейс для представления полного решения математической задачи
 */
export interface Solution {
  steps: SolutionStep[];                                // Шаги решения
  result: string;                                       // Итоговый результат
  type: string;                                         // Тип решения (например, 'linear-equation', 'calculation')
  difficulty: 'basic' | 'intermediate' | 'advanced';    // Сложность задачи
  visualization?: VisualizationData;                    // Данные для визуализации
}

/**
 * Абстрактный класс для всех решателей математических задач
 */
export abstract class MathSolver {
  /**
   * Проверяет, может ли данный решатель обработать входную строку
   * @param input Входная строка с математическим выражением
   * @returns true, если решатель может обработать данный ввод, иначе false
   */
  abstract canSolve(input: string): boolean;
  
  /**
   * Решает математическую задачу и возвращает пошаговое решение
   * @param input Входная строка с математическим выражением
   * @returns Объект Solution с пошаговым решением
   */
  abstract solve(input: string): Solution;
  
  /**
   * Возвращает тип решателя
   * @returns Строка, идентифицирующая тип решателя
   */
  abstract getType(): string;
}
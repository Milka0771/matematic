import { MathSolver, Solution, SolutionStep } from './MathSolver';
import * as math from 'mathjs';

// Расширенные типы для работы с узлами mathjs
interface OperatorNode extends math.MathNode {
  type: 'OperatorNode';
  op: string;
  args: math.MathNode[];
}

interface FunctionNode extends math.MathNode {
  type: 'FunctionNode';
  fn: { toString: () => string };
  args: math.MathNode[];
}

// Проверка типа узла
function isOperatorNode(node: math.MathNode): node is OperatorNode {
  return node.type === 'OperatorNode';
}

function isFunctionNode(node: math.MathNode): node is FunctionNode {
  return node.type === 'FunctionNode';
}

/**
 * Решатель для вычисления математических выражений
 */
export class CalculationSolver extends MathSolver {
  /**
   * Проверяет, может ли данный решатель обработать входную строку
   * @param input Входная строка с математическим выражением
   * @returns true, если строка не содержит знак равенства (т.е. это выражение для вычисления)
   */
  canSolve(input: string): boolean {
    // Проверяем, является ли ввод выражением для вычисления (не содержит знак равенства)
    return !input.includes('=') && this.isValidExpression(input);
  }

  /**
   * Возвращает тип решателя
   * @returns Строка 'calculation'
   */
  getType(): string {
    return 'calculation';
  }

  /**
   * Проверяет, является ли выражение допустимым для вычисления
   * @param input Входная строка с математическим выражением
   * @returns true, если выражение можно вычислить
   */
  private isValidExpression(input: string): boolean {
    try {
      // Пробуем распарсить выражение
      math.parse(input);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Решает математическое выражение и возвращает пошаговое решение
   * @param input Входная строка с математическим выражением
   * @returns Объект Solution с пошаговым решением
   */
  solve(input: string): Solution {
    const steps: SolutionStep[] = [];
    
    try {
      // Шаг 1: Парсинг выражения
      const node = math.parse(input);
      steps.push({
        description: 'Анализ выражения',
        formula: input,
        explanation: 'Разбираем математическое выражение на составные части.',
        detailedExplanation: 'Математический парсер анализирует структуру выражения, определяя операции, операнды и их порядок вычисления согласно правилам математики.'
      });
      
      // Шаг 2: Структура выражения
      steps.push({
        description: 'Структура выражения',
        formula: node.toString(),
        explanation: 'Представляем выражение в структурированном виде для анализа.',
        detailedExplanation: 'Структурное представление показывает иерархию операций в выражении, что помогает понять порядок вычислений.'
      });
      
      // Шаг 3: Пошаговое вычисление для сложных выражений
      if (this.isComplexExpression(node)) {
        const subSteps = this.generateSubSteps(node);
        steps.push(...subSteps);
      }
      
      // Шаг 4: Итоговый результат
      const result = math.evaluate(input);
      steps.push({
        description: 'Итоговый результат',
        formula: `${input} = ${math.format(result)}`,
        explanation: 'Получаем окончательный результат вычисления выражения.',
        detailedExplanation: 'После выполнения всех операций в правильном порядке, получаем числовое значение, которое является результатом вычисления исходного выражения.'
      });
      
      // Добавляем визуализацию для функций
      let visualization = undefined;
      
      // Проверяем, является ли выражение функцией от одной переменной
      const variables = this.findVariables(node);
      if (variables.length === 1) {
        const variable = variables[0];
        // Проверяем, что выражение не слишком сложное для визуализации
        if (!input.includes('=') && this.isVisualizableExpression(input, variable)) {
          visualization = {
            type: 'function-graph' as const,
            expression: input,
            variable: variable,
            xRange: [-10, 10] as [number, number]
          };
        }
      }
      
      return {
        steps,
        result: math.format(result),
        type: 'calculation',
        difficulty: this.determineDifficulty(node),
        visualization
      };
    } catch (error) {
      // В случае ошибки возвращаем информацию об ошибке
      return {
        steps: [{
          description: 'Ошибка вычисления',
          formula: input,
          explanation: `Произошла ошибка при вычислении: ${error instanceof Error ? error.message : String(error)}`
        }],
        result: 'Ошибка',
        type: 'calculation-error',
        difficulty: 'basic'
      };
    }
  }

  /**
   * Определяет, является ли выражение сложным (содержит вложенные операции)
   * @param node Узел выражения
   * @returns true, если выражение сложное
   */
  private isComplexExpression(node: math.MathNode): boolean {
    if (isOperatorNode(node)) {
      // Проверяем, содержит ли операторный узел другие операторные узлы
      return node.args.some((arg: math.MathNode) =>
        arg.type === 'OperatorNode' ||
        arg.type === 'FunctionNode'
      );
    }
    return node.type === 'FunctionNode';
  }

  /**
   * Генерирует промежуточные шаги для сложного выражения
   * @param node Узел выражения
   * @returns Массив шагов решения
   */
  private generateSubSteps(node: math.MathNode): SolutionStep[] {
    const steps: SolutionStep[] = [];
    
    if (isOperatorNode(node)) {
      // Для операторного узла разбиваем на подвыражения
      const leftNode = node.args[0];
      const rightNode = node.args[1];
      const operator = node.op;
      
      try {
        const leftResult = math.evaluate(leftNode.toString());
        const rightResult = math.evaluate(rightNode.toString());
        
        steps.push({
          description: 'Вычисление подвыражений',
          formula: `${leftNode.toString()} = ${math.format(leftResult)}, ${rightNode.toString()} = ${math.format(rightResult)}`,
          explanation: 'Вычисляем каждую часть выражения отдельно.',
          detailedExplanation: 'Разбиение сложного выражения на более простые части позволяет последовательно вычислить результат, применяя базовые арифметические операции.'
        });
        
        // Добавляем шаг с промежуточным результатом
        const operatorSymbol = this.getOperatorSymbol(operator);
        steps.push({
          description: 'Применение операции',
          formula: `${math.format(leftResult)} ${operatorSymbol} ${math.format(rightResult)} = ${math.format(math.evaluate(`${leftResult} ${operator} ${rightResult}`))}`,
          explanation: `Выполняем операцию ${this.getOperationName(operator)}.`,
          detailedExplanation: `Применяем операцию ${this.getOperationName(operator)} к вычисленным значениям подвыражений.`
        });
      } catch (error) {
        console.error('Error generating substeps:', error);
      }
    } else if (isFunctionNode(node)) {
      // Для функционального узла показываем применение функции
      const funcName = node.fn.toString();
      const args = node.args.map((arg: math.MathNode) => arg.toString());
      
      try {
        const argResults = args.map((arg: string) => math.format(math.evaluate(arg)));
        const result = math.format(math.evaluate(node.toString()));
        
        steps.push({
          description: `Вычисление аргументов функции ${funcName}`,
          formula: args.map((arg: string, i: number) => `${arg} = ${argResults[i]}`).join(', '),
          explanation: 'Вычисляем значения аргументов функции.',
          detailedExplanation: 'Перед применением функции необходимо вычислить значения всех её аргументов.'
        });
        
        steps.push({
          description: `Применение функции ${funcName}`,
          formula: `${funcName}(${argResults.join(', ')}) = ${result}`,
          explanation: `Вычисляем результат функции ${funcName}.`,
          detailedExplanation: `Применяем функцию ${funcName} к вычисленным значениям аргументов.`
        });
      } catch (error) {
        console.error('Error generating function substeps:', error);
      }
    }
    
    return steps;
  }

  /**
   * Возвращает символ операции для отображения
   * @param operator Строковое представление операции
   * @returns Символ операции
   */
  private getOperatorSymbol(operator: string): string {
    const symbols: Record<string, string> = {
      '+': '+',
      '-': '−',
      '*': '×',
      '/': '÷',
      '^': '^'
    };
    return symbols[operator] || operator;
  }

  /**
   * Возвращает название операции
   * @param operator Строковое представление операции
   * @returns Название операции
   */
  private getOperationName(operator: string): string {
    const names: Record<string, string> = {
      '+': 'сложения',
      '-': 'вычитания',
      '*': 'умножения',
      '/': 'деления',
      '^': 'возведения в степень'
    };
    return names[operator] || operator;
  }

  /**
   * Определяет сложность выражения
   * @param node Узел выражения
   * @returns Уровень сложности
   */
  /**
   * Находит все переменные в выражении
   * @param node Узел выражения
   * @returns Массив имен переменных
   */
  private findVariables(node: math.MathNode): string[] {
    const variables: Set<string> = new Set();
    
    const traverse = (n: math.MathNode) => {
      if (n.type === 'SymbolNode') {
        // Исключаем константы, такие как e, pi и т.д.
        const name = (n as any).name;
        if (name && !['e', 'pi', 'i'].includes(name)) {
          variables.add(name);
        }
      }
      
      // Рекурсивно обходим дочерние узлы
      if (isOperatorNode(n)) {
        n.args.forEach(traverse);
      } else if (n.type === 'FunctionNode') {
        (n as any).args.forEach(traverse);
      }
    };
    
    traverse(node);
    return Array.from(variables);
  }
  
  /**
   * Проверяет, можно ли визуализировать выражение как график функции
   * @param expression Выражение
   * @param variable Переменная
   * @returns true, если выражение можно визуализировать
   */
  private isVisualizableExpression(expression: string, variable: string): boolean {
    try {
      // Проверяем, что выражение можно вычислить для разных значений переменной
      const testValues = [-5, -1, 0, 1, 5];
      const compiledExpression = math.compile(expression);
      
      for (const value of testValues) {
        const scope: Record<string, number> = {};
        scope[variable] = value;
        const result = compiledExpression.evaluate(scope);
        
        // Если результат не число или бесконечность, то не визуализируем
        if (typeof result !== 'number' || !isFinite(result)) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Определяет сложность выражения
   * @param node Узел выражения
   * @returns Уровень сложности
   */
  private determineDifficulty(node: math.MathNode): 'basic' | 'intermediate' | 'advanced' {
    // Подсчитываем количество операций и функций
    let operationCount = 0;
    let hasFunctions = false;
    let hasAdvancedFunctions = false;
    
    // Рекурсивно обходим дерево выражения
    const traverse = (n: math.MathNode) => {
      if (isOperatorNode(n)) {
        operationCount++;
        n.args.forEach(traverse);
      } else if (isFunctionNode(n)) {
        hasFunctions = true;
        const funcName = n.fn.toString();
        if (['sin', 'cos', 'tan', 'log', 'exp'].includes(funcName)) {
          hasAdvancedFunctions = true;
        }
        n.args.forEach(traverse);
      }
    };
    
    traverse(node);
    
    // Определяем сложность на основе количества операций и наличия функций
    if (hasAdvancedFunctions || operationCount > 3) {
      return 'advanced';
    } else if (hasFunctions || operationCount > 1) {
      return 'intermediate';
    } else {
      return 'basic';
    }
  }
}
import { MathSolver, Solution, SolutionStep } from './MathSolver';
import * as math from 'mathjs';

// Расширенные типы для работы с узлами mathjs
interface OperatorNode extends math.MathNode {
  type: 'OperatorNode';
  op: string;
  args: math.MathNode[];
}

interface SymbolNode extends math.MathNode {
  type: 'SymbolNode';
  name: string;
}

// Проверка типа узла
function isOperatorNode(node: math.MathNode): node is OperatorNode {
  return node.type === 'OperatorNode';
}

function isSymbolNode(node: math.MathNode): node is SymbolNode {
  return node.type === 'SymbolNode';
}

/**
 * Решатель для алгебраических уравнений
 */
export class AlgebraicSolver extends MathSolver {
  /**
   * Проверяет, может ли данный решатель обработать входную строку
   * @param input Входная строка с математическим выражением
   * @returns true, если строка содержит знак равенства (т.е. это уравнение)
   */
  canSolve(input: string): boolean {
    return input.includes('=') && this.isValidEquation(input);
  }

  /**
   * Возвращает тип решателя
   * @returns Строка 'algebraic'
   */
  getType(): string {
    return 'algebraic';
  }

  /**
   * Проверяет, является ли уравнение допустимым для решения
   * @param input Входная строка с уравнением
   * @returns true, если уравнение можно решить
   */
  private isValidEquation(input: string): boolean {
    try {
      // Проверяем, что строка содержит ровно один знак равенства
      const parts = input.split('=');
      if (parts.length !== 2) {
        return false;
      }

      // Проверяем, что обе части уравнения можно распарсить
      math.parse(parts[0]);
      math.parse(parts[1]);
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Решает алгебраическое уравнение и возвращает пошаговое решение
   * @param input Входная строка с уравнением
   * @returns Объект Solution с пошаговым решением
   */
  solve(input: string): Solution {
    const steps: SolutionStep[] = [];
    
    try {
      // Разбиваем уравнение на левую и правую части
      const [left, right] = input.split('=').map(part => part.trim());
      
      // Шаг 1: Запись исходного уравнения
      steps.push({
        description: 'Исходное уравнение',
        formula: `${left} = ${right}`,
        explanation: 'Начинаем с исходного уравнения, которое нужно решить.',
        detailedExplanation: 'Уравнение - это математическое равенство, содержащее одну или несколько переменных. Решить уравнение означает найти значения переменных, при которых равенство становится верным.'
      });
      
      // Шаг 2: Приведение к стандартной форме (все в левой части, 0 в правой)
      const standardForm = `(${left}) - (${right})`;
      let simplified = math.simplify(standardForm).toString();
      
      steps.push({
        description: 'Приведение к стандартной форме',
        formula: `${simplified} = 0`,
        explanation: 'Переносим все члены уравнения в левую часть, чтобы правая часть была равна нулю.',
        detailedExplanation: 'Стандартная форма уравнения вида "выражение = 0" упрощает дальнейшее решение. Для этого мы вычитаем правую часть из обеих частей уравнения.'
      });
      
      // Определяем тип уравнения и решаем соответствующим методом
      const equationType = this.determineEquationType(simplified);
      
      switch (equationType) {
        case 'linear':
          return this.solveLinearEquation(simplified, steps);
        case 'quadratic':
          return this.solveQuadraticEquation(simplified, steps);
        default:
          // Для неизвестных типов уравнений
          steps.push({
            description: 'Определение типа уравнения',
            formula: simplified,
            explanation: 'Данное уравнение не относится к известным типам (линейное, квадратное).',
            detailedExplanation: 'Для решения этого уравнения требуются специальные методы или численные подходы.'
          });
          
          return {
            steps,
            result: 'Не удалось определить метод решения',
            type: 'unknown-equation',
            difficulty: 'advanced'
          };
      }
    } catch (error) {
      // В случае ошибки возвращаем информацию об ошибке
      return {
        steps: [{
          description: 'Ошибка решения',
          formula: input,
          explanation: `Произошла ошибка при решении уравнения: ${error instanceof Error ? error.message : String(error)}`
        }],
        result: 'Ошибка',
        type: 'algebraic-error',
        difficulty: 'basic'
      };
    }
  }

  /**
   * Определяет тип уравнения (линейное, квадратное и т.д.)
   * @param expression Выражение в стандартной форме (левая часть уравнения)
   * @returns Строка, обозначающая тип уравнения
   */
  private determineEquationType(expression: string): 'linear' | 'quadratic' | 'unknown' {
    try {
      // Находим все переменные в выражении
      const node = math.parse(expression);
      const variables = this.findVariables(node);
      
      if (variables.length === 0) {
        return 'unknown'; // Нет переменных
      }
      
      // Для простоты предполагаем, что у нас только одна переменная
      const variable = variables[0];
      
      // Проверяем степень переменной
      const degree = this.findHighestDegree(node, variable);
      
      if (degree === 1) {
        return 'linear';
      } else if (degree === 2) {
        return 'quadratic';
      } else {
        return 'unknown';
      }
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * Находит все переменные в выражении
   * @param node Узел выражения
   * @returns Массив имен переменных
   */
  private findVariables(node: math.MathNode): string[] {
    const variables: Set<string> = new Set();
    
    const traverse = (n: math.MathNode) => {
      if (isSymbolNode(n)) {
        // Исключаем константы, такие как e, pi и т.д.
        if (!['e', 'pi', 'i'].includes(n.name)) {
          variables.add(n.name);
        }
      }
      
      // Рекурсивно обходим дочерние узлы
      if (isOperatorNode(n)) {
        n.args.forEach(traverse);
      }
    };
    
    traverse(node);
    return Array.from(variables);
  }

  /**
   * Находит наивысшую степень переменной в выражении
   * @param node Узел выражения
   * @param variable Имя переменной
   * @returns Наивысшая степень переменной
   */
  private findHighestDegree(node: math.MathNode, variable: string): number {
    let highestDegree = 0;
    
    const traverse = (n: math.MathNode, currentDegree: number = 1) => {
      if (isSymbolNode(n) && n.name === variable) {
        highestDegree = Math.max(highestDegree, currentDegree);
      } else if (isOperatorNode(n)) {
        if (n.op === '^' && isSymbolNode(n.args[0]) && n.args[0].name === variable) {
          // Если это операция возведения в степень и основание - наша переменная
          try {
            const power = math.evaluate(n.args[1].toString());
            if (typeof power === 'number') {
              highestDegree = Math.max(highestDegree, power);
            }
          } catch (error) {
            // Игнорируем ошибки при вычислении степени
          }
        } else {
          // Рекурсивно обходим аргументы
          n.args.forEach(arg => traverse(arg, currentDegree));
        }
      }
    };
    
    traverse(node);
    return highestDegree;
  }

  /**
   * Решает линейное уравнение вида ax + b = 0
   * @param expression Выражение в стандартной форме
   * @param steps Массив шагов решения
   * @returns Объект Solution с пошаговым решением
   */
  private solveLinearEquation(expression: string, steps: SolutionStep[]): Solution {
    // Находим переменную
    const node = math.parse(expression);
    const variables = this.findVariables(node);
    
    if (variables.length === 0) {
      steps.push({
        description: 'Ошибка решения',
        formula: expression,
        explanation: 'Не удалось найти переменную в уравнении.'
      });
      
      return {
        steps,
        result: 'Ошибка: нет переменной',
        type: 'linear-equation-error',
        difficulty: 'basic'
      };
    }
    
    const variable = variables[0];
    
    // Приводим к виду ax + b = 0
    try {
      // Собираем коэффициенты при переменной и свободный член
      const coefficients = this.collectCoefficients(expression, variable);
      const a = coefficients.a;
      const b = coefficients.b;
      
      // Шаг 3: Группировка членов с переменной и без
      steps.push({
        description: 'Группировка членов',
        formula: `${a}${variable} + ${b} = 0`,
        explanation: 'Группируем члены с переменной и без переменной.',
        detailedExplanation: 'Для решения линейного уравнения необходимо сгруппировать все члены с переменной в левой части и все свободные члены в правой части.'
      });
      
      // Шаг 4: Перенос свободного члена в правую часть
      steps.push({
        description: 'Перенос свободного члена',
        formula: `${a}${variable} = ${-b}`,
        explanation: 'Переносим свободный член в правую часть уравнения с противоположным знаком.',
        detailedExplanation: 'При переносе члена из одной части уравнения в другую его знак меняется на противоположный.'
      });
      
      // Шаг 5: Деление на коэффициент при переменной
      const solution = -b / a;
      
      steps.push({
        description: 'Деление на коэффициент при переменной',
        formula: `${variable} = \\frac{${-b}}{${a}} = ${solution}`,
        explanation: `Делим обе части уравнения на коэффициент при ${variable}.`,
        detailedExplanation: 'Чтобы найти значение переменной, делим обе части уравнения на коэффициент при этой переменной.'
      });
      
      // Шаг 6: Проверка решения
      const checkLeft = math.evaluate(`${a} * ${solution} + ${b}`);
      
      steps.push({
        description: 'Проверка решения',
        formula: `${a} \\cdot ${solution} + ${b} = ${checkLeft} \\approx 0`,
        explanation: 'Подставляем найденное значение переменной в исходное уравнение для проверки.',
        detailedExplanation: 'Для проверки правильности решения подставляем найденное значение переменной в исходное уравнение и проверяем, что левая часть равна правой.'
      });
      
      return {
        steps,
        result: `${variable} = ${solution}`,
        type: 'linear-equation',
        difficulty: 'basic',
        visualization: {
          type: 'function-graph',
          expression: expression,
          variable: variable,
          xRange: [solution - 5, solution + 5],
          solutionPoints: [solution]
        }
      };
    } catch (error) {
      steps.push({
        description: 'Ошибка решения',
        formula: expression,
        explanation: `Произошла ошибка при решении линейного уравнения: ${error instanceof Error ? error.message : String(error)}`
      });
      
      return {
        steps,
        result: 'Ошибка решения',
        type: 'linear-equation-error',
        difficulty: 'basic'
      };
    }
  }

  /**
   * Собирает коэффициенты линейного уравнения ax + b = 0
   * @param expression Выражение в стандартной форме
   * @param variable Имя переменной
   * @returns Объект с коэффициентами a и b
   */
  private collectCoefficients(expression: string, variable: string): { a: number, b: number } {
    // Заменяем переменную на 1 и вычисляем, чтобы получить коэффициент a
    const withOne = expression.replace(new RegExp(variable, 'g'), '1');
    const withZero = expression.replace(new RegExp(variable, 'g'), '0');
    
    try {
      // Коэффициент при переменной
      const a = math.evaluate(withOne) - math.evaluate(withZero);
      // Свободный член
      const b = math.evaluate(withZero);
      
      return { a, b };
    } catch (error) {
      throw new Error(`Не удалось собрать коэффициенты: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Решает квадратное уравнение вида ax² + bx + c = 0
   * @param expression Выражение в стандартной форме
   * @param steps Массив шагов решения
   * @returns Объект Solution с пошаговым решением
   */
  private solveQuadraticEquation(expression: string, steps: SolutionStep[]): Solution {
    // Находим переменную
    const node = math.parse(expression);
    const variables = this.findVariables(node);
    
    if (variables.length === 0) {
      steps.push({
        description: 'Ошибка решения',
        formula: expression,
        explanation: 'Не удалось найти переменную в уравнении.'
      });
      
      return {
        steps,
        result: 'Ошибка: нет переменной',
        type: 'quadratic-equation-error',
        difficulty: 'intermediate'
      };
    }
    
    const variable = variables[0];
    
    try {
      // Собираем коэффициенты при x², x и свободный член
      const coefficients = this.collectQuadraticCoefficients(expression, variable);
      const a = coefficients.a;
      const b = coefficients.b;
      const c = coefficients.c;
      
      // Шаг 3: Запись в стандартной форме квадратного уравнения
      steps.push({
        description: 'Стандартная форма квадратного уравнения',
        formula: `${a}${variable}^2 + ${b}${variable} + ${c} = 0`,
        explanation: 'Записываем уравнение в стандартной форме ax² + bx + c = 0.',
        detailedExplanation: 'Квадратное уравнение в стандартной форме имеет вид ax² + bx + c = 0, где a, b и c - числовые коэффициенты, а a ≠ 0.'
      });
      
      // Шаг 4: Вычисление дискриминанта
      const discriminant = b * b - 4 * a * c;
      
      steps.push({
        description: 'Вычисление дискриминанта',
        formula: `D = b^2 - 4ac = ${b}^2 - 4 \\cdot ${a} \\cdot ${c} = ${discriminant}`,
        explanation: 'Вычисляем дискриминант по формуле D = b² - 4ac.',
        detailedExplanation: 'Дискриминант квадратного уравнения определяет количество и характер его корней: если D > 0, то уравнение имеет два различных действительных корня; если D = 0, то уравнение имеет один действительный корень (двойной); если D < 0, то уравнение не имеет действительных корней.'
      });
      
      // Шаг 5: Нахождение корней в зависимости от дискриминанта
      if (discriminant > 0) {
        // Два различных корня
        const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        
        steps.push({
          description: 'Нахождение корней',
          formula: `${variable}_1 = \\frac{-b + \\sqrt{D}}{2a} = \\frac{${-b} + \\sqrt{${discriminant}}}{2 \\cdot ${a}} = ${x1}\\\\
${variable}_2 = \\frac{-b - \\sqrt{D}}{2a} = \\frac{${-b} - \\sqrt{${discriminant}}}{2 \\cdot ${a}} = ${x2}`,
          explanation: 'Находим два корня уравнения по формуле x = (-b ± √D) / (2a).',
          detailedExplanation: 'Для квадратного уравнения с положительным дискриминантом существуют два различных действительных корня, которые находятся по формуле x = (-b ± √D) / (2a).'
        });
        
        // Шаг 6: Проверка решения
        const check1 = math.evaluate(`${a} * ${x1}^2 + ${b} * ${x1} + ${c}`);
        const check2 = math.evaluate(`${a} * ${x2}^2 + ${b} * ${x2} + ${c}`);
        
        steps.push({
          description: 'Проверка решения',
          formula: `${a}(${x1})^2 + ${b}(${x1}) + ${c} = ${check1} \\approx 0\\\\
${a}(${x2})^2 + ${b}(${x2}) + ${c} = ${check2} \\approx 0`,
          explanation: 'Подставляем найденные значения переменной в исходное уравнение для проверки.',
          detailedExplanation: 'Для проверки правильности решения подставляем найденные значения переменной в исходное уравнение и проверяем, что левая часть равна правой.'
        });
        
        return {
          steps,
          result: `${variable}_1 = ${x1}, ${variable}_2 = ${x2}`,
          type: 'quadratic-equation',
          difficulty: 'intermediate',
          visualization: {
            type: 'function-graph',
            expression: expression,
            variable: variable,
            xRange: [Math.min(x1, x2) - 3, Math.max(x1, x2) + 3],
            solutionPoints: [x1, x2]
          }
        };
      } else if (discriminant === 0) {
        // Один корень (двойной)
        const x = -b / (2 * a);
        
        steps.push({
          description: 'Нахождение корня',
          formula: `${variable} = \\frac{-b}{2a} = \\frac{${-b}}{2 \\cdot ${a}} = ${x}`,
          explanation: 'Находим единственный корень уравнения по формуле x = -b / (2a).',
          detailedExplanation: 'Для квадратного уравнения с нулевым дискриминантом существует один действительный корень (двойной), который находится по формуле x = -b / (2a).'
        });
        
        // Проверка решения
        const check = math.evaluate(`${a} * ${x}^2 + ${b} * ${x} + ${c}`);
        
        steps.push({
          description: 'Проверка решения',
          formula: `${a}(${x})^2 + ${b}(${x}) + ${c} = ${check} \\approx 0`,
          explanation: 'Подставляем найденное значение переменной в исходное уравнение для проверки.',
          detailedExplanation: 'Для проверки правильности решения подставляем найденное значение переменной в исходное уравнение и проверяем, что левая часть равна правой.'
        });
        
        return {
          steps,
          result: `${variable} = ${x} (двойной корень)`,
          type: 'quadratic-equation',
          difficulty: 'intermediate',
          visualization: {
            type: 'function-graph',
            expression: expression,
            variable: variable,
            xRange: [x - 5, x + 5],
            solutionPoints: [x]
          }
        };
      } else {
        // Нет действительных корней
        steps.push({
          description: 'Отсутствие действительных корней',
          formula: `D < 0`,
          explanation: 'Уравнение не имеет действительных корней, так как дискриминант отрицательный.',
          detailedExplanation: 'Если дискриминант квадратного уравнения отрицательный, то уравнение не имеет действительных корней, но имеет два комплексных сопряженных корня.'
        });
        
        // Вычисляем комплексные корни
        const realPart = -b / (2 * a);
        const imagPart = Math.sqrt(-discriminant) / (2 * a);
        
        steps.push({
          description: 'Нахождение комплексных корней',
          formula: `${variable}_1 = \\frac{-b}{2a} + i\\frac{\\sqrt{-D}}{2a} = ${realPart} + ${imagPart}i\\\\
${variable}_2 = \\frac{-b}{2a} - i\\frac{\\sqrt{-D}}{2a} = ${realPart} - ${imagPart}i`,
          explanation: 'Находим комплексные корни уравнения.',
          detailedExplanation: 'Для квадратного уравнения с отрицательным дискриминантом существуют два комплексных сопряженных корня вида x = α ± βi, где α = -b/(2a) и β = √(-D)/(2a).'
        });
        
        return {
          steps,
          result: `${variable}_1 = ${realPart} + ${imagPart}i, ${variable}_2 = ${realPart} - ${imagPart}i`,
          type: 'quadratic-equation-complex',
          difficulty: 'advanced',
          visualization: {
            type: 'function-graph',
            expression: expression,
            variable: variable,
            xRange: [realPart - 5, realPart + 5]
          }
        };
      }
    } catch (error) {
      steps.push({
        description: 'Ошибка решения',
        formula: expression,
        explanation: `Произошла ошибка при решении квадратного уравнения: ${error instanceof Error ? error.message : String(error)}`
      });
      
      return {
        steps,
        result: 'Ошибка решения',
        type: 'quadratic-equation-error',
        difficulty: 'intermediate'
      };
    }
  }

  /**
   * Собирает коэффициенты квадратного уравнения ax² + bx + c = 0
   * @param expression Выражение в стандартной форме
   * @param variable Имя переменной
   * @returns Объект с коэффициентами a, b и c
   */
  private collectQuadraticCoefficients(expression: string, variable: string): { a: number, b: number, c: number } {
    try {
      // Заменяем x² на 1, x на 0 и вычисляем, чтобы получить коэффициент a
      const withOneSquare = expression
        .replace(new RegExp(`${variable}\\^2`, 'g'), '1')
        .replace(new RegExp(variable, 'g'), '0');
      
      // Заменяем x² на 0, x на 1 и вычисляем, чтобы получить коэффициент b
      const withOneX = expression
        .replace(new RegExp(`${variable}\\^2`, 'g'), '0')
        .replace(new RegExp(variable, 'g'), '1');
      
      // Заменяем x² на 0, x на 0 и вычисляем, чтобы получить коэффициент c
      const withZero = expression
        .replace(new RegExp(`${variable}\\^2`, 'g'), '0')
        .replace(new RegExp(variable, 'g'), '0');
      
      // Коэффициент при x²
      const a = math.evaluate(withOneSquare);
      // Коэффициент при x
      const b = math.evaluate(withOneX) - math.evaluate(withZero);
      // Свободный член
      const c = math.evaluate(withZero);
      
      return { a, b, c };
    } catch (error) {
      throw new Error(`Не удалось собрать коэффициенты: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as math from 'mathjs';

interface FunctionGraphProps {
  // Функция для визуализации (в виде строки)
  expression: string;
  // Переменная в функции (по умолчанию 'x')
  variable?: string;
  // Диапазон значений по оси X
  xRange?: [number, number];
  // Ширина графика
  width?: number;
  // Высота графика
  height?: number;
  // Цвет линии графика
  lineColor?: string;
  // Цвет осей
  axisColor?: string;
  // Цвет сетки
  gridColor?: string;
  // Показывать ли сетку
  showGrid?: boolean;
  // Показывать ли точки решения (для уравнений)
  solutionPoints?: number[];
}

/**
 * Компонент для визуализации графиков математических функций с помощью D3.js
 */
const FunctionGraph: React.FC<FunctionGraphProps> = ({
  expression,
  variable = 'x',
  xRange = [-10, 10],
  width = 600,
  height = 400,
  lineColor = '#3b82f6', // blue-500
  axisColor = '#374151', // gray-700
  gridColor = '#e5e7eb', // gray-200
  showGrid = true,
  solutionPoints = []
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    try {
      // Очищаем предыдущий график
      d3.select(svgRef.current).selectAll('*').remove();
      setError(null);

      // Компилируем выражение
      const compiledExpression = math.compile(expression);

      // Создаем функцию для вычисления значений
      const func = (x: number) => {
        try {
          const scope: Record<string, number> = {};
          scope[variable] = x;
          return compiledExpression.evaluate(scope);
        } catch (err) {
          return NaN;
        }
      };

      // Генерируем точки для графика
      const points: [number, number][] = [];
      const step = (xRange[1] - xRange[0]) / 500;
      
      for (let x = xRange[0]; x <= xRange[1]; x += step) {
        const y = func(x);
        if (!isNaN(y) && isFinite(y)) {
          points.push([x, y]);
        }
      }

      if (points.length === 0) {
        setError('Не удалось построить график для данной функции');
        return;
      }

      // Находим минимальное и максимальное значения y
      const yValues = points.map(p => p[1]);
      let yMin = Math.min(...yValues);
      let yMax = Math.max(...yValues);

      // Добавляем отступы для лучшего отображения
      const yPadding = (yMax - yMin) * 0.1;
      yMin -= yPadding;
      yMax += yPadding;

      // Если диапазон y слишком мал, расширяем его
      if (Math.abs(yMax - yMin) < 1) {
        yMin = Math.floor(yMin) - 1;
        yMax = Math.ceil(yMax) + 1;
      }

      // Создаем масштабы для осей
      const margin = { top: 20, right: 30, bottom: 40, left: 50 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const xScale = d3.scaleLinear()
        .domain(xRange)
        .range([0, innerWidth]);

      const yScale = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([innerHeight, 0]);

      // Создаем SVG контейнер
      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Добавляем сетку, если нужно
      if (showGrid) {
        // Вертикальные линии сетки
        svg.append('g')
          .attr('class', 'grid')
          .attr('transform', `translate(0,${innerHeight})`)
          .call(
            d3.axisBottom(xScale)
              .tickSize(-innerHeight)
              .tickFormat(() => '')
          )
          .attr('color', gridColor)
          .attr('stroke-opacity', 0.5)
          .attr('stroke-dasharray', '3,3');

        // Горизонтальные линии сетки
        svg.append('g')
          .attr('class', 'grid')
          .call(
            d3.axisLeft(yScale)
              .tickSize(-innerWidth)
              .tickFormat(() => '')
          )
          .attr('color', gridColor)
          .attr('stroke-opacity', 0.5)
          .attr('stroke-dasharray', '3,3');
      }

      // Добавляем оси
      svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${yScale(0) > innerHeight ? innerHeight : (yScale(0) < 0 ? 0 : yScale(0))})`)
        .call(d3.axisBottom(xScale))
        .attr('color', axisColor);

      svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${xScale(0) > innerWidth ? innerWidth : (xScale(0) < 0 ? 0 : xScale(0))},0)`)
        .call(d3.axisLeft(yScale))
        .attr('color', axisColor);

      // Создаем линию графика
      const line = d3.line<[number, number]>()
        .x(d => xScale(d[0]))
        .y(d => yScale(d[1]))
        .curve(d3.curveMonotoneX);

      // Добавляем линию на график
      svg.append('path')
        .datum(points)
        .attr('fill', 'none')
        .attr('stroke', lineColor)
        .attr('stroke-width', 2)
        .attr('d', line);

      // Добавляем точки решения, если они есть
      if (solutionPoints.length > 0) {
        solutionPoints.forEach(x => {
          const y = func(x);
          if (!isNaN(y) && isFinite(y)) {
            svg.append('circle')
              .attr('cx', xScale(x))
              .attr('cy', yScale(y))
              .attr('r', 5)
              .attr('fill', '#ef4444') // red-500
              .attr('stroke', '#ffffff')
              .attr('stroke-width', 2);
            
            // Добавляем подпись к точке
            svg.append('text')
              .attr('x', xScale(x))
              .attr('y', yScale(y) - 10)
              .attr('text-anchor', 'middle')
              .attr('font-size', '12px')
              .attr('fill', '#000000')
              .text(`(${x.toFixed(2)}, ${y.toFixed(2)})`);
          }
        });
      }

      // Добавляем заголовок графика
      svg.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', axisColor)
        .text(`График функции: ${expression}`);

    } catch (err) {
      console.error('Error rendering function graph:', err);
      setError(`Ошибка построения графика: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [expression, variable, xRange, width, height, lineColor, axisColor, gridColor, showGrid, solutionPoints]);

  return (
    <div className="function-graph-container">
      {error && (
        <div className="error-message p-2 mb-2 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      <svg 
        ref={svgRef} 
        className="function-graph bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
        width={width} 
        height={height}
      />
    </div>
  );
};

export default FunctionGraph;
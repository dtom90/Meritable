import { useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { Colors } from '@/lib/Colors';
import { useListHabitCompletionsByHabitId } from '@/db/useHabitDb';
import {
  buildDailyCountSeries,
  formatChartDateLabel,
  getChartXLabelAnchor,
  getChartXLabelIndexes,
  getChartYMax,
} from '@/lib/habitCountChart';

const CHART_HEIGHT = 200;
const PADDING = { top: 28, right: 16, bottom: 28, left: 36 };
const DAY_COUNT = 15;
const HIT_RADIUS = 18;
const TOOLTIP_WIDTH = 112;

type ChartPoint = {
  date: string;
  count: number;
  x: number;
  y: number;
};

type HabitDailyCountChartProps = {
  habitId: number;
  countTarget: number;
};

export default function HabitDailyCountChart({ habitId, countTarget }: HabitDailyCountChartProps) {
  const { data: completions = [], isLoading } = useListHabitCompletionsByHabitId(habitId);
  const [width, setWidth] = useState(0);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const series = useMemo(
    () => buildDailyCountSeries(completions, { dayCount: DAY_COUNT }),
    [completions]
  );

  const yMax = useMemo(() => getChartYMax(series, countTarget), [series, countTarget]);
  const hasAnyCount = series.some((point) => point.count > 0);

  const onLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width;
    if (nextWidth > 0 && nextWidth !== width) {
      setWidth(nextWidth);
    }
  };

  const plotWidth = Math.max(0, width - PADDING.left - PADDING.right);
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const points = useMemo((): ChartPoint[] => {
    if (plotWidth <= 0 || series.length === 0) return [];

    return series.map((point, index) => {
      const x =
        series.length === 1
          ? PADDING.left + plotWidth / 2
          : PADDING.left + (index / (series.length - 1)) * plotWidth;
      const y = PADDING.top + plotHeight - (point.count / yMax) * plotHeight;
      return { ...point, x, y };
    });
  }, [series, plotWidth, plotHeight, yMax]);

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const targetY = PADDING.top + plotHeight - (countTarget / yMax) * plotHeight;

  const yTicks = [0, Math.round(yMax / 2), yMax].filter(
    (value, index, arr) => arr.indexOf(value) === index
  );

  const xLabelIndexes = getChartXLabelIndexes(series.length);
  const activeDate = hoveredDate ?? selectedDate;
  const activePoint = points.find((point) => point.date === activeDate) ?? null;

  const clearInteraction = () => {
    setHoveredDate(null);
    setSelectedDate(null);
  };

  const handlePointPress = (date: string) => {
    setSelectedDate((current) => (current === date ? null : date));
  };

  const tooltipLeft = activePoint
    ? Math.min(
        Math.max(activePoint.x - TOOLTIP_WIDTH / 2, 0),
        Math.max(width - TOOLTIP_WIDTH, 0)
      )
    : 0;
  const tooltipTop = activePoint
    ? activePoint.y < PADDING.top + 24
      ? activePoint.y + 14
      : activePoint.y - 44
    : 0;

  return (
    <View className="p-6 rounded-lg mb-6" style={{ backgroundColor: Colors.surface }}>
      <Text className="text-lg font-semibold mb-1" style={{ color: Colors.text }}>
        Daily Count
      </Text>
      <Text className="text-sm mb-4" style={{ color: Colors.textSecondary }}>
        Last {DAY_COUNT} days · tap or hover a point for details
      </Text>

      {isLoading ? (
        <Text style={{ color: Colors.textSecondary }}>Loading chart…</Text>
      ) : !hasAnyCount ? (
        <Text style={{ color: Colors.textSecondary }}>
          Log counts to see your daily progress over time.
        </Text>
      ) : (
        <View onLayout={onLayout} style={{ width: '100%' }}>
          {width > 0 && (
            <Pressable onPress={clearInteraction} style={{ width, height: CHART_HEIGHT }}>
              <Svg width={width} height={CHART_HEIGHT} pointerEvents="none">
                {/* Horizontal grid + Y labels */}
                {yTicks.map((tick) => {
                  const y = PADDING.top + plotHeight - (tick / yMax) * plotHeight;
                  return (
                    <G key={`ytick-${tick}`}>
                      <Line
                        x1={PADDING.left}
                        y1={y}
                        x2={width - PADDING.right}
                        y2={y}
                        stroke={Colors.border}
                        strokeWidth={1}
                      />
                      <SvgText
                        x={PADDING.left - 8}
                        y={y + 4}
                        fill={Colors.textSecondary}
                        fontSize={11}
                        textAnchor="end"
                      >
                        {tick}
                      </SvgText>
                    </G>
                  );
                })}

                {/* Target line */}
                {countTarget > 0 && (
                  <G>
                    <Line
                      x1={PADDING.left}
                      y1={targetY}
                      x2={width - PADDING.right}
                      y2={targetY}
                      stroke={Colors.success}
                      strokeWidth={1.5}
                      strokeDasharray="6 4"
                      opacity={0.7}
                    />
                    <SvgText
                      x={width - PADDING.right}
                      y={targetY - 6}
                      fill={Colors.success}
                      fontSize={10}
                      textAnchor="end"
                    >
                      Target {countTarget}
                    </SvgText>
                  </G>
                )}

                {/* Active vertical guide */}
                {activePoint && (
                  <Line
                    x1={activePoint.x}
                    y1={PADDING.top}
                    x2={activePoint.x}
                    y2={PADDING.top + plotHeight}
                    stroke={Colors.primary}
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    opacity={0.45}
                  />
                )}

                {/* Trend line */}
                {points.length > 1 && (
                  <Polyline
                    points={polylinePoints}
                    fill="none"
                    stroke={Colors.primary}
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                )}

                {/* Visible points */}
                {points.map((point) => {
                  const isActive = point.date === activeDate;
                  const hasCount = point.count > 0;
                  return (
                    <Circle
                      key={`dot-${point.date}`}
                      cx={point.x}
                      cy={point.y}
                      r={isActive ? 5.5 : hasCount ? 3.5 : 2}
                      fill={hasCount || isActive ? Colors.primary : Colors.border}
                      stroke={isActive ? Colors.text : undefined}
                      strokeWidth={isActive ? 1.5 : 0}
                    />
                  );
                })}

                {/* X labels */}
                {xLabelIndexes.map((index) => {
                  const point = points[index];
                  if (!point) return null;
                  return (
                    <SvgText
                      key={`xlabel-${point.date}`}
                      x={point.x}
                      y={CHART_HEIGHT - 8}
                      fill={Colors.textSecondary}
                      fontSize={11}
                      textAnchor={getChartXLabelAnchor(index, points.length)}
                    >
                      {formatChartDateLabel(point.date)}
                    </SvgText>
                  );
                })}
              </Svg>

              {/* Hit targets above the SVG for tap + hover */}
              {points.map((point) => (
                <Pressable
                  key={`hit-${point.date}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${formatChartDateLabel(point.date)}: ${point.count}`}
                  onPress={(event) => {
                    event.stopPropagation?.();
                    handlePointPress(point.date);
                  }}
                  onHoverIn={() => setHoveredDate(point.date)}
                  onHoverOut={() => setHoveredDate(null)}
                  style={{
                    position: 'absolute',
                    left: point.x - HIT_RADIUS,
                    top: point.y - HIT_RADIUS,
                    width: HIT_RADIUS * 2,
                    height: HIT_RADIUS * 2,
                    borderRadius: HIT_RADIUS,
                  }}
                />
              ))}

              {activePoint && (
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    left: tooltipLeft,
                    top: tooltipTop,
                    width: TOOLTIP_WIDTH,
                    backgroundColor: Colors.card,
                    borderColor: Colors.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    className="text-xs font-semibold text-center"
                    style={{ color: Colors.text }}
                  >
                    {formatChartDateLabel(activePoint.date)}
                  </Text>
                  <Text
                    className="text-sm font-bold text-center"
                    style={{ color: Colors.primary }}
                  >
                    {activePoint.count}
                  </Text>
                </View>
              )}
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

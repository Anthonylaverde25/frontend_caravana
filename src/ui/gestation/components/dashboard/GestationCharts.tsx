import ReactEcharts from 'echarts-for-react';
import { useTheme } from '@mui/material/styles';

interface PregnancyStatusChartProps {
  pregnant: number;
  empty: number;
}

export function PregnancyStatusChart({ pregnant, empty }: PregnancyStatusChartProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const textColor = theme.palette.text.primary;
  const secondaryTextColor = theme.palette.text.secondary;

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: <b>{c}</b> ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: '0%',
      left: 'center',
      textStyle: { color: secondaryTextColor, fontSize: 10 }
    },
    series: [
      {
        name: 'Estado Reproductivo',
        type: 'pie',
        radius: ['55%', '75%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: isDark ? theme.palette.background.paper : '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold',
            formatter: '{b}\n{d}%',
            color: textColor
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: pregnant, name: 'Preñadas', itemStyle: { color: '#0a6ed1' } },
          { value: empty, name: 'Vacías', itemStyle: { color: isDark ? 'rgba(255, 255, 255, 0.2)' : '#e2e8f0' } }
        ]
      }
    ]
  };

  return <ReactEcharts option={option} style={{ height: '100%', width: '100%' }} />;
}

interface PregnancyStageChartProps {
  headCount: number;
  bodyCount: number;
  tailCount: number;
}

export function PregnancyStageChart({ headCount, bodyCount, tailCount }: PregnancyStageChartProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const textColor = theme.palette.text.primary;
  const secondaryTextColor = theme.palette.text.secondary;

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: <b>{c}</b> ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: '0%',
      left: 'center',
      textStyle: { color: secondaryTextColor, fontSize: 10 }
    },
    series: [
      {
        name: 'Distribución de Preñez',
        type: 'pie',
        radius: ['55%', '75%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: isDark ? theme.palette.background.paper : '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold',
            formatter: '{b}\n{d}%',
            color: textColor
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: headCount, name: 'Cabeza', itemStyle: { color: '#10b981' } },
          { value: bodyCount, name: 'Cuerpo', itemStyle: { color: '#f59e0b' } },
          { value: tailCount, name: 'Cola', itemStyle: { color: '#ef4444' } }
        ]
      }
    ]
  };

  return <ReactEcharts option={option} style={{ height: '100%', width: '100%' }} />;
}

interface CalvingCalendarChartProps {
  next5Months: Array<{ label: string }>;
  calvingCalendarData: {
    headData: number[];
    bodyData: number[];
    tailData: number[];
  };
}

export function CalvingCalendarChart({ next5Months, calvingCalendarData }: CalvingCalendarChartProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const secondaryTextColor = theme.palette.text.secondary;
  const gridLineColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)';

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      textStyle: { color: secondaryTextColor, fontSize: 10 },
      bottom: '0%'
    },
    grid: {
      top: '10%',
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: next5Months.map((m) => m.label),
        axisLabel: { color: secondaryTextColor, fontSize: 10 },
        axisLine: { lineStyle: { color: gridLineColor } }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: 'Partos',
        nameTextStyle: { color: secondaryTextColor, fontSize: 10 },
        axisLabel: { color: secondaryTextColor, fontSize: 10 },
        axisLine: { lineStyle: { color: gridLineColor } },
        splitLine: { lineStyle: { color: gridLineColor } }
      }
    ],
    series: [
      {
        name: 'Cabeza (Parto Temprano)',
        type: 'bar',
        stack: 'Adul',
        emphasis: { focus: 'series' },
        itemStyle: { color: '#10b981' },
        data: calvingCalendarData.headData
      },
      {
        name: 'Cuerpo (Parto Medio)',
        type: 'bar',
        stack: 'Adul',
        emphasis: { focus: 'series' },
        itemStyle: { color: '#f59e0b' },
        data: calvingCalendarData.bodyData
      },
      {
        name: 'Cola (Parto Tardío)',
        type: 'bar',
        stack: 'Adul',
        emphasis: { focus: 'series' },
        itemStyle: { color: '#ef4444', borderRadius: [2, 2, 0, 0] },
        data: calvingCalendarData.tailData
      }
    ]
  };

  return <ReactEcharts option={option} style={{ height: '100%', width: '100%' }} />;
}

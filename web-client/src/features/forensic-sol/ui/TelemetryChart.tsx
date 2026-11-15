import { Box, Text } from '@chakra-ui/react';
import type React from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TelemetryPoint } from '../model/useForensicSol';

interface TelemetryChartProps {
  data?: TelemetryPoint[];
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({ data = [] }) => {
  // Graceful fallback telemetry points if payload is empty
  const chartData =
    data.length > 0
      ? data.map((d) => ({
          sol: `Sol ${d.sol}`,
          raw_sol: d.sol,
          power_wh: d.power_wh,
          dust_tau_scaled: Math.round(d.dust_tau * 100),
          tilt_deg_scaled: Math.round(d.tilt_deg * 10),
          raw_dust: d.dust_tau,
          raw_tilt: d.tilt_deg,
        }))
      : [
          { sol: 'Sol 1', raw_sol: 1, power_wh: 580, dust_tau_scaled: 30, tilt_deg_scaled: 25 },
          { sol: 'Sol 15', raw_sol: 15, power_wh: 520, dust_tau_scaled: 45, tilt_deg_scaled: 30 },
          { sol: 'Sol 30', raw_sol: 30, power_wh: 310, dust_tau_scaled: 85, tilt_deg_scaled: 60 },
          { sol: 'Sol 45', raw_sol: 45, power_wh: 220, dust_tau_scaled: 110, tilt_deg_scaled: 75 },
          { sol: 'Sol 60', raw_sol: 60, power_wh: 430, dust_tau_scaled: 50, tilt_deg_scaled: 35 },
        ];

  return (
    <Box
      w="100%"
      h="300px"
      bg="gray.950"
      p={3}
      borderRadius="xl"
      border="1px solid"
      borderColor="gray.800"
      boxShadow="inset 0 0 20px rgba(0, 0, 0, 0.5)"
    >
      <Box mb={2} px={2} display="flex" justifyContent="space-between" alignItems="center">
        <Text
          fontSize="2xs"
          color="gray.400"
          fontWeight="bold"
          textTransform="uppercase"
          letterSpacing="wider"
        >
          ТЕЛЕМЕТРІЯ МІСІЇ (ЕНЕРГІЯ, ПИЛ, НАХИЛ)
        </Text>
        <Text fontSize="3xs" color="gray.500">
          Пил: tau×100 · Нахил: deg×10
        </Text>
      </Box>

      <ResponsiveContainer width="100%" height="88%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
          <XAxis dataKey="sol" stroke="#718096" fontSize={11} tickLine={false} />
          <YAxis stroke="#718096" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1A202C',
              borderColor: '#4A5568',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#FFFFFF',
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
            formatter={(value: string) => {
              if (value === 'power_wh') return 'Потужність (Wh)';
              if (value === 'dust_tau_scaled') return 'Пил (tau × 100)';
              if (value === 'tilt_deg_scaled') return 'Нахил (deg × 10)';
              return value;
            }}
          />
          <Line
            type="monotone"
            dataKey="power_wh"
            stroke="#48BB78"
            strokeWidth={2}
            dot={{ r: 3, fill: '#48BB78' }}
            name="power_wh"
          />
          <Line
            type="monotone"
            dataKey="dust_tau_scaled"
            stroke="#ED8936"
            strokeWidth={2}
            dot={{ r: 3, fill: '#ED8936' }}
            name="dust_tau_scaled"
          />
          <Line
            type="monotone"
            dataKey="tilt_deg_scaled"
            stroke="#4299E1"
            strokeWidth={2}
            dot={{ r: 3, fill: '#4299E1' }}
            name="tilt_deg_scaled"
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

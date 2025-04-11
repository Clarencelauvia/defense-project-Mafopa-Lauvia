import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LoginFrequencyGraphProps {
  loginDates: string[];
}

interface MonthlyCount {
  month: string;
  count: number;
}

const LoginFrequencyGraph: React.FC<LoginFrequencyGraphProps> = ({ loginDates }) => {
  // Process login dates to count total logins by month
  const monthlyLoginData = useMemo<MonthlyCount[]>(() => {
    if (!loginDates || !Array.isArray(loginDates) || loginDates.length === 0) {
      return [];
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize counts for each month
    const monthlyCounts: MonthlyCount[] = months.map(month => ({
      month,
      count: 0,
    }));
    
    // Count each login occurrence for the month
    loginDates.forEach(dateStr => {
      try {
        // Parse the date string
        const date = new Date(dateStr);
        
        if (!isNaN(date.getTime())) { // Check if date is valid
          const monthIndex = date.getMonth();
          // Increment the count for this month
          monthlyCounts[monthIndex].count += 1;
        } else {
          console.error('Invalid date format:', dateStr);
        }
      } catch (error) {
        console.error('Error parsing date:', dateStr, error);
      }
    });
  
    return monthlyCounts;
  }, [loginDates]);

  return (
    <div className="h-80">
      {monthlyLoginData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyLoginData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3b82f619" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#93c5fd' }} 
              axisLine={{ stroke: '#3b82f640' }}
            />
<YAxis 
  tick={{ fill: '#93c5fd' }} 
  axisLine={{ stroke: '#3b82f640' }}
  allowDecimals={false}
  domain={[1, 31]}
  ticks={Array.from({ length: 30 }, (_, i) => i + 2)}
  interval={3} // Force display of all ticks
  label={{ 
    value: 'Login Count', 
    angle: -90, 
    position: 'insideLeft', 
    fill: '#93c5fd', 
    style: { textAnchor: 'middle' } 
  }}
/>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                color: '#fff'
              }}
              labelStyle={{ color: '#dbeafe' }}
              formatter={(value: any) => [`${value} login${value !== 1 ? 's' : ''}`, 'Total Logins']}
            />
            <Bar 
              dataKey="count" 
              name="Total Logins" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-blue-200">No login data available</p>
        </div>
      )}
    </div>
  );
};

export default LoginFrequencyGraph;
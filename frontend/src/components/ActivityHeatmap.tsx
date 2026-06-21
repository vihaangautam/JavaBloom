import React from 'react';
import { ActivityCalendar } from 'react-activity-calendar';
import { useUserStore } from '../store/userStore';

export const ActivityHeatmap: React.FC = () => {
  const getHeatmapData = useUserStore((state) => state.getHeatmapData);
  const data = getHeatmapData();

  // Create a full 365-day array or at least ensure data is populated
  // react-activity-calendar handles empty dates automatically, but let's ensure we pass the data.
  // The theme should use our defined purple values:
  const themeColors = {
    light: ['#f3f4f6', '#e9d5ff', '#c084fc', '#a855f7', '#7c3aed'] as [string, string, string, string, string],
    dark: ['#f3f4f6', '#e9d5ff', '#c084fc', '#a855f7', '#7c3aed'] as [string, string, string, string, string],
  };

  // Quick summary stats
  const totalActivities = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <h3 className="font-display text-2xl uppercase tracking-wider text-gray-800">
          Activity Graph
        </h3>
        <div className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          {totalActivities} Action{totalActivities === 1 ? '' : 's'} logged this year
        </div>
      </div>

      <div className="flex justify-center overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-gray-200">
        <div className="min-w-[620px] p-2 bg-gray-50/50 rounded-2xl border border-gray-100">
          <ActivityCalendar
            data={data}
            theme={themeColors}
            showColorLegend={true}
            showTotalCount={false}
            labels={{
              months: [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
              ],
              weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
              totalCount: '{{count}} activities in {{year}}',
              legend: {
                less: 'Less',
                more: 'More',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

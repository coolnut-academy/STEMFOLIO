import React from 'react';
import { TimelineEvent } from '@/types';

interface PortfolioTimelineProps {
  highlights: TimelineEvent[];
}

export const PortfolioTimeline = ({ highlights }: PortfolioTimelineProps) => {
  if (highlights.length === 0) return null;

  return (
    <div className="mb-12">
      <h3 className="text-xl font-bold text-gray-900 mb-6 border-l-4 border-[var(--accent-blue)] pl-3">
        ผลงานและความคืบหน้าที่โดดเด่น
      </h3>

      <div className="flex flex-col gap-8">
        {highlights.map(event => (
          <div key={event.id} className="flex gap-4 page-break-inside-avoid">
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-[var(--accent-blue)] rounded-full mt-1.5" />
              <div className="w-0.5 h-full bg-blue-100 mt-2" />
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="text-sm font-bold text-blue-600 mb-1">
                {event.createdAt ? event.createdAt.toDate().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h4>
              
              {event.description && (
                <p className="text-gray-700 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                  {event.description}
                </p>
              )}

              {event.attachments && event.attachments.filter(a => a.type === 'image').length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {event.attachments.filter(a => a.type === 'image').map(img => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={img.id} src={img.url} alt={img.name} className="w-full h-40 object-cover rounded-lg border border-gray-200" />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

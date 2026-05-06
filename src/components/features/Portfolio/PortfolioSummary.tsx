import React from 'react';
import { TimelineEvent } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface PortfolioSummaryProps {
  submissions: TimelineEvent[];
}

export const PortfolioSummary = ({ submissions }: PortfolioSummaryProps) => {
  // We want to combine submissions and their results if linked.
  // Actually, we can just map over submission events and find their corresponding results.
  
  const subEvents = submissions.filter(e => e.type === 'submission');
  const resultEvents = submissions.filter(e => e.type === 'result');

  const summaryData = subEvents.map(sub => {
    const result = resultEvents.find(r => r.linkedSubmissionId === sub.id);
    return {
      id: sub.id,
      competitionName: sub.competitionName,
      date: sub.submittedDate ? sub.submittedDate.toDate().toLocaleDateString('th-TH') : (sub.deadline ? sub.deadline.toDate().toLocaleDateString('th-TH') : 'ยังไม่ระบุ'),
      status: sub.submissionStatus,
      result: result ? result.result : null
    };
  });

  // Include results that are not linked to any submission
  resultEvents.forEach(res => {
    if (!res.linkedSubmissionId || !subEvents.some(s => s.id === res.linkedSubmissionId)) {
      summaryData.push({
        id: res.id,
        competitionName: res.competitionName || 'ไม่ระบุเวที',
        date: res.createdAt ? res.createdAt.toDate().toLocaleDateString('th-TH') : 'ไม่ระบุ',
        status: 'submitted',
        result: res.result
      });
    }
  });

  if (summaryData.length === 0) return null;

  return (
    <div className="mb-12 page-break-inside-avoid">
      <h3 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-[var(--accent-purple)] pl-3">
        ประวัติการเข้าร่วมแข่งขัน / นำเสนอ
      </h3>
      
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-4 py-3">เวทีการแข่งขัน</th>
              <th className="px-4 py-3 w-32">วันที่ส่ง / จัดงาน</th>
              <th className="px-4 py-3 w-40 text-center">ผลลัพธ์</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {summaryData.map(item => (
              <tr key={item.id} className="bg-white">
                <td className="px-4 py-3 font-medium text-gray-900">{item.competitionName}</td>
                <td className="px-4 py-3 text-gray-500">{item.date}</td>
                <td className="px-4 py-3 text-center">
                  {item.result === 'award' ? <Badge variant="blue">ได้รับรางวัล</Badge> :
                   item.result === 'pass' ? <Badge variant="green">ผ่านการคัดเลือก</Badge> :
                   item.result === 'fail' ? <Badge variant="red">ไม่ผ่าน</Badge> :
                   item.result === 'pending' ? <Badge variant="yellow">รอประกาศผล</Badge> :
                   item.status === 'submitted' ? <Badge variant="gray">ส่งแล้ว (รอผล)</Badge> :
                   <Badge variant="gray">เตรียมตัว</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

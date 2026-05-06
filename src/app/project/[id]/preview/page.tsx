"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPortfolioData, PortfolioData } from '@/lib/firestore/portfolio';
import { PortfolioHeader } from '@/components/features/Portfolio/PortfolioHeader';
import { PortfolioSummary } from '@/components/features/Portfolio/PortfolioSummary';
import { PortfolioTimeline } from '@/components/features/Portfolio/PortfolioTimeline';
import { Spinner } from '@/components/ui/Spinner';
import { Printer, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function PortfolioPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { user, role, loading: authLoading } = useAuth();
  
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    const fetchData = async () => {
      try {
        const pd = await getPortfolioData(projectId);
        
        // Auth Logic
        if (!pd.project.isPublic) {
          if (!user) {
            router.push('/login');
            return;
          }
          const isMember = pd.project.studentIds.includes(user.uid) || pd.project.advisorIds.includes(user.uid);
          const isAdmin = role === 'admin';
          if (!isMember && !isAdmin) {
            setError('คุณไม่มีสิทธิ์เข้าถึงโครงงานนี้');
            setLoading(false);
            return;
          }
        }
        
        setData(pd);
      } catch (err) {
        setError('ไม่พบโครงงาน หรือเกิดข้อผิดพลาด');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, user, role, authLoading, router]);

  if (loading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Spinner className="w-8 h-8 text-blue-500" /></div>;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <p className="text-gray-500 text-lg">{error}</p>
        <button onClick={() => router.push('/')} className="text-blue-500 hover:underline">กลับหน้าแรก</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Action Bar (Not visible in print) */}
      <div className="print:hidden bg-gray-100 border-b border-gray-200 py-3 px-4 flex justify-between items-center sticky top-0 z-50">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> กลับ
        </button>
        <div className="flex items-center gap-3">
          {!data.project.isPublic && (
            <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded border border-orange-200">
              โครงงานส่วนตัว (Private)
            </span>
          )}
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" /> พิมพ์ / PDF
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[800px] mx-auto px-6 py-12 print:px-0 print:py-0 print:pt-4">
        <PortfolioHeader 
          project={data.project} 
          students={data.students} 
          advisors={data.advisors} 
        />
        
        <PortfolioSummary submissions={data.submissions} />
        
        <PortfolioTimeline highlights={data.highlights} />
        
        {data.highlights.length === 0 && data.submissions.length === 0 && (
          <div className="text-center py-20 text-gray-400 italic">
            ยังไม่มีประวัติการส่งแข่งหรือผลงานเด่น
          </div>
        )}
      </div>
    </div>
  );
}

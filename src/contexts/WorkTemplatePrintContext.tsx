import React, { createContext, useContext, useRef, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router';
import { useReactToPrint } from 'react-to-print';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { useWorkTemplate } from '@/ui/work-templates/hooks/useWorkTemplate';
import { useCompany } from '@/contexts/CompanyContext';
import { useServiceOrder } from '@/features/gestation/hooks/useServiceOrders';
import { useCaravans } from '@/features/caravans/hooks/useCaravans';
import { useBatch } from '@/features/batches/hooks/useBatch';
import { useFarms } from '@/features/suppliers/hooks/useFarms';
import { useSuppliers } from '@/features/suppliers/hooks/useSuppliers';
import { WorkTemplate } from '@/ui/work-templates/types/TemplateModels';

interface WorkTemplatePrintContextType {
  code?: string;
  template: WorkTemplate | null;
  order: any;
  batch: any;
  farm: any;
  provider: any;
  caravans: any[];
  isLoading: boolean;
  error: string | null;
  printAreaRef: React.RefObject<HTMLDivElement | null>;
  handlePrint: () => void;
  handleDownload: () => void;
  handleBack: () => void;
  batchId: number | null;
}

const WorkTemplatePrintContext = createContext<WorkTemplatePrintContextType | undefined>(undefined);

export const WorkTemplatePrintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const printAreaRef = useRef<HTMLDivElement>(null);

  const orderId = searchParams.get('orderId') ? Number(searchParams.get('orderId')) : null;
  const batchId = searchParams.get('batchId') ? Number(searchParams.get('batchId')) : null;

  // Retrieve template structure
  const { template, isLoading: isLoadingTemplate, error: templateError } = useWorkTemplate(code);

  // Retrieve Company context & backend resources
  const { activeCompanyId } = useCompany();
  const { data: order, isLoading: isLoadingOrder } = useServiceOrder(orderId);
  const { data: caravans = [], isLoading: isLoadingCaravans } = useCaravans(code === 'REP-01' ? activeCompanyId : null);
  const { data: batch, isLoading: isLoadingBatch } = useBatch(batchId || order?.batch_id);
  const { data: allFarms = [], isLoading: isLoadingFarms } = useFarms();
  const { data: providers = [], isLoading: isLoadingProviders } = useSuppliers();

  // Find farm and supplier related to batch (if order loaded)
  const farm = useMemo(() => {
    if (!batch?.farm_id) return null;
    return allFarms.find((f) => f.id === batch.farm_id);
  }, [allFarms, batch?.farm_id]);

  const provider = useMemo(() => {
    if (!batch?.provider_id) return null;
    return providers.find((p) => p.id === batch.provider_id);
  }, [providers, batch?.provider_id]);

  // Setup printing configuration
  const handlePrint = useReactToPrint({
    contentRef: printAreaRef,
    documentTitle: `Planilla_De_${code || 'Plantilla'}_${order?.code || 'Vacia'}`,
    pageStyle: `
      @page { size: A4 portrait; margin: 0; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `,
  });

  // Setup PDF download configuration
  const handleDownload = () => {
    const element = printAreaRef.current;
    if (!element) return;

    const opt = {
      margin: 0,
      filename: `Planilla_${code || 'Plantilla'}_${order?.code || 'Vacia'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 3,
        useCORS: true,
        letterRendering: true,
        logging: false,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      pagebreak: { mode: ['css', 'legacy'], before: '.print-page', avoid: '.print-page' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleBack = () => {
    navigate(-1);
  };

  const isLoading =
    isLoadingTemplate ||
    (orderId ? isLoadingOrder || isLoadingCaravans || isLoadingBatch || isLoadingFarms || isLoadingProviders : false) ||
    (batchId ? isLoadingCaravans || isLoadingBatch || isLoadingFarms || isLoadingProviders : false);

  const contextValue = useMemo(
    () => ({
      code,
      template,
      order,
      batch,
      farm,
      provider,
      caravans,
      isLoading,
      error: templateError,
      printAreaRef,
      handlePrint,
      handleDownload,
      handleBack,
      batchId
    }),
    [
      code,
      template,
      order,
      batch,
      farm,
      provider,
      caravans,
      isLoading,
      templateError,
      handlePrint,
      handleDownload,
      handleBack,
      batchId
    ]
  );

  return (
    <WorkTemplatePrintContext.Provider value={contextValue}>
      {children}
    </WorkTemplatePrintContext.Provider>
  );
};

export const useWorkTemplatePrint = () => {
  const context = useContext(WorkTemplatePrintContext);
  if (context === undefined) {
    throw new Error('useWorkTemplatePrint must be used within a WorkTemplatePrintProvider');
  }
  return context;
};

import { useNavigate } from 'react-router';
import ItemDocumentsView from './ItemDocumentsView';
import InitialStockEntryDialog from '../components/initial-stock/InitialStockEntryDialog';

/** `/item-documents/new/initial-stock`: the full-screen entry over the operations list. */
export default function InitialStockEntryView() {
	const navigate = useNavigate();

	return (
		<>
			<ItemDocumentsView />
			<InitialStockEntryDialog onClose={() => navigate('/item-documents')} onDone={(d) => navigate(`/item-documents/${d.id}`)} />
		</>
	);
}

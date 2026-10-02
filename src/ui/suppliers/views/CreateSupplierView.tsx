import { Navigate } from 'react-router';

/**
 * CreateSupplierView Component (Deprecated)
 * Redirects to /providers with the modal opened.
 */
export default function CreateSupplierView() {
  return <Navigate to="/providers?action=create" replace />;
}

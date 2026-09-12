import { Navigate, useLocation, useSearchParams } from 'react-router';
import { FuseRouteItemType } from '@fuse/utils/FuseUtils';

/**
 * Legacy route. The chute sheet stopped being a page of its own: it is stage 2 of
 * `/gestation/pre-service`, so that the set of animals it certifies is always an explicit
 * selection carried in the URL.
 *
 * Kept as a redirect so saved links and old `navigate()` calls still land somewhere sane,
 * carrying whatever selection they had.
 */
function EvaluateRedirect() {
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const stateIds = (location.state as { selectedBullIds?: number[] } | null)?.selectedBullIds;
  const ids = searchParams.get('ids') ?? (stateIds?.length ? stateIds.join(',') : null);

  const target = ids
    ? `/gestation/pre-service?stage=sheet&ids=${ids}`
    : '/gestation/pre-service';

  return <Navigate to={target} replace />;
}

const route: FuseRouteItemType = {
  path: 'gestation/pre-service/evaluate',
  element: <EvaluateRedirect />
};

export default route;

import { memo } from 'react';
import QuickActionsSpeedDial from '../../components/QuickActionsSpeedDial';

type ToolbarLayout2Props = {
	className?: string;
};

/**
 * ToolbarLayout2.
 * In the unified single-row Layout 2 design, the toolbar controls (CompanySelector,
 * ThemeToggle, Settings, UserMenu) are consolidated into NavbarLayout2.
 * This component keeps QuickActionsSpeedDial mounted fixed in the viewport without
 * rendering a redundant second row in the header.
 */
function ToolbarLayout2(props: ToolbarLayout2Props) {
	return <QuickActionsSpeedDial />;
}

export default memo(ToolbarLayout2);

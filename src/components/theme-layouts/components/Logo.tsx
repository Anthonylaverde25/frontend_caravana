import { styled, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import clsx from "clsx";
import { useContrastTheme } from "@/contexts/ContrastThemeContext";

const Root = styled("div")(({ theme }) => ({
  "& > .logo-icon": {
    transition: theme.transitions.create(["width", "height"], {
      duration: theme.transitions.duration.shortest,
      easing: theme.transitions.easing.easeInOut,
    }),
  },
  "& > .badge": {
    transition: theme.transitions.create("opacity", {
      duration: theme.transitions.duration.shortest,
      easing: theme.transitions.easing.easeInOut,
    }),
  },
}));

type LogoProps = {
  className?: string;
  size?: "small" | "medium" | "large";
  forceDark?: boolean;
  showSubtext?: boolean;
  onClick?: () => void;
};

const isColorDark = (hexColor: string): boolean => {
  if (!hexColor || !hexColor.startsWith("#")) return false;
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
};

/**
 * The enterprise logo component.
 * Supports compact (small), standard (medium), and showcase (large) variants
 * with forced dark-mode contrast for persistent dark headers.
 */
function Logo(props: LogoProps) {
  const {
    className = "",
    size = "medium",
    forceDark = false,
    showSubtext = true,
    onClick,
  } = props;
  const theme = useTheme();
  const { settings: contrastSettings } = useContrastTheme();
  const isThemeDark = theme.palette.mode === "dark";

  const isContrastActive = contrastSettings.enabled && !forceDark;
  const isDark =
    forceDark ||
    (isContrastActive && contrastSettings.asideBg
      ? isColorDark(contrastSettings.asideBg)
      : isThemeDark);

  const logoSrc = isDark
    ? "/assets/images/logo/logo-light.svg"
    : "/assets/images/logo/logo-dark.svg";

  const primaryTextColor = forceDark
    ? "#26D07C"
    : isContrastActive && contrastSettings.asideText
      ? contrastSettings.asideText
      : isDark
        ? "#26D07C"
        : "#0E3D26";

  const secondaryTextColor = forceDark
    ? "#A7F3D0"
    : isContrastActive && contrastSettings.asideText
      ? contrastSettings.asideText
      : isDark
        ? "#A7F3D0"
        : "#3A6351";

  const iconClasses = {
    small: "h-7 w-7",
    medium: "h-12 w-12",
    large: "h-16 w-16",
  }[size];

  const titleClasses = {
    small: "text-lg tracking-wider",
    medium: "text-3xl tracking-wider",
    large: "text-4xl tracking-wider",
  }[size];

  const subtitleClasses = {
    small: "text-[9px] tracking-widest",
    medium: "text-[11px] tracking-widest",
    large: "text-[13px] tracking-widest",
  }[size];

  const gapClass = {
    small: "gap-2",
    medium: "gap-3.5",
    large: "gap-4",
  }[size];

  return (
    <Root
      className={clsx(
        "flex flex-shrink-0 flex-grow items-center",
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      <div className={clsx("flex flex-1 items-center", gapClass)}>
        <img
          className={clsx("logo-icon shrink-0 object-contain", iconClasses)}
          src={logoSrc}
          alt="RXNA Sistema Ganadero"
        />
        <div className="logo-text flex flex-auto flex-col">
          <Typography
            className={clsx("leading-none font-black", titleClasses)}
            style={{
              color: primaryTextColor,
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            RXNA
          </Typography>
          {showSubtext && (
            <Typography
              className={clsx("uppercase leading-none font-bold mt-0.5", subtitleClasses)}
              style={{
                color: secondaryTextColor,
                fontFamily: "system-ui, -apple-system, sans-serif",
                letterSpacing: "0.2em",
                opacity: isContrastActive ? 0.85 : 1,
              }}
            >
              Sistema Ganadero
            </Typography>
          )}
        </div>
      </div>
    </Root>
  );
}

export default Logo;

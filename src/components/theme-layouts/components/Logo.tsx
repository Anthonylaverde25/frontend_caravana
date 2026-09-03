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
 * The logo component.
 */
function Logo(props: LogoProps) {
  const { className = "" } = props;
  const theme = useTheme();
  const { settings: contrastSettings } = useContrastTheme();
  const isThemeDark = theme.palette.mode === "dark";

  const isContrastActive = contrastSettings.enabled;
  const isDark =
    isContrastActive && contrastSettings.asideBg
      ? isColorDark(contrastSettings.asideBg)
      : isThemeDark;

  const logoSrc = isDark
    ? "/assets/images/logo/logo-light.svg"
    : "/assets/images/logo/logo-dark.svg";

  const primaryTextColor =
    isContrastActive && contrastSettings.asideText
      ? contrastSettings.asideText
      : isDark
        ? "#26D07C"
        : "#0E3D26";

  const secondaryTextColor =
    isContrastActive && contrastSettings.asideText
      ? contrastSettings.asideText
      : isDark
        ? "#A7F3D0"
        : "#3A6351";

  return (
    <Root
      className={clsx(
        "flex flex-shrink-0 flex-grow items-center gap-3",
        className,
      )}
    >
      <div className="flex flex-1 items-center gap-3.5">
        <img
          className="logo-icon h-12 w-12 shrink-0 object-contain"
          src={logoSrc}
          alt="logo"
        />
        <div className="logo-text flex flex-auto flex-col gap-1">
          <Typography
            className="tracking-wider text-3xl leading-none font-black"
            style={{
              color: primaryTextColor,
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            RXNA
          </Typography>
          <Typography
            className="tracking-widest text-[11px] uppercase leading-none font-bold"
            style={{
              color: secondaryTextColor,
              fontFamily: "system-ui, -apple-system, sans-serif",
              letterSpacing: "0.2em",
              opacity: isContrastActive ? 0.85 : 1,
            }}
          >
            Sistema Ganadero
          </Typography>
        </div>
      </div>
    </Root>
  );
}

export default Logo;

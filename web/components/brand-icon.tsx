import Image from "next/image";
import logo from "../public/brand/logo.png";
import error from "../public/brand/fridgy_error.png";
import noResults from "../public/brand/fridgy_no_results.png";
import emptyState from "../public/brand/fridgy_empty_state.png";
import shopping from "../public/brand/fridgy_shopping.png";
import welcomeOnboarding from "../public/brand/fridgy_welcome_onboarding.png";
import success from "../public/brand/fridgy_success.png";
import cookingRecipe from "../public/brand/fridgy_cooking_recipe.png";
import expiringSoon from "../public/brand/fridgy_expiring_soon.png";
import noInternet from "../public/brand/fridgy_no_internet.png";
import maintenance from "../public/brand/fridgy_maintenance.png";
import warning from "../public/brand/fridgy_warning.png";
import search from "../public/brand/fridgy_search.png";
import celebrate from "../public/brand/fridgy_celebrate.png";

const icons = {
  logo,
  error,
  no_results: noResults,
  empty_state: emptyState,
  shopping,
  welcome_onboarding: welcomeOnboarding,
  success,
  cooking_recipe: cookingRecipe,
  expiring_soon: expiringSoon,
  no_internet: noInternet,
  maintenance,
  warning,
  search,
  celebrate,
};

type BrandIconName = keyof typeof icons;

export function BrandIcon({ name, className = "" }: { name: BrandIconName; className?: string }) {
  return <Image src={icons[name]} alt="" className={`shrink-0 object-contain ${className}`} aria-hidden="true" />;
}

export function BrandWordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`font-extrabold tracking-[-0.055em] ${className}`}
      style={{ fontFamily: 'ui-rounded, "Arial Rounded MT Bold", "Trebuchet MS", sans-serif' }}
    >
      Fridgy
    </span>
  );
}

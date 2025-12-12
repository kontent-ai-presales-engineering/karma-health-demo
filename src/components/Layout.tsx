import { FC, PropsWithChildren } from "react";
import Footer from "./Footer";
import Header from "./Header";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { SmartLinkContextComponent } from "../context/SmartLinkContext";
import { AppContextComponent } from "../context/AppContext";

const Layout: FC<PropsWithChildren> = () => {
  return (
    <AppContextComponent>
      <SmartLinkContextComponent>
        <div className="flex flex-col min-h-screen">
          <ScrollRestoration getKey={location => location.pathname} />
          <Header />
          <Outlet />
          <Footer />
        </div>
      </SmartLinkContextComponent>
    </AppContextComponent>
  );
};

export default Layout;

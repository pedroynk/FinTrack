import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Outlet } from "react-router-dom";
// import { CustomCursor } from "@/components/custom-cursor";

export default function DefaultLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* <CustomCursor /> */}
      <Header />
        <main>
          <Outlet />
        </main>
      <Footer />
    </div>
  );
}

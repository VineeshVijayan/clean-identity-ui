import { NdashHeader } from "@/components/ndash/NdashHeader";
import { NdashHero } from "@/components/ndash/NdashHero";
import { NdashServices } from "@/components/ndash/NdashServices";
import { NdashClients } from "@/components/ndash/NdashClients";
import { NdashTeam } from "@/components/ndash/NdashTeam";
import { NdashContact } from "@/components/ndash/NdashContact";
import { NdashFooter } from "@/components/ndash/NdashFooter";

const NdashHome = () => {
  return (
    <div className="min-h-screen bg-background">
      <NdashHeader />
      <main>
        <NdashHero />
        <NdashServices />
        <NdashClients />
        <NdashTeam />
        <NdashContact />
      </main>
      <NdashFooter />
    </div>
  );
};

export default NdashHome;

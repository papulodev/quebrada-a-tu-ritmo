import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  Mountain,
  Route,
  Compass,
  Shield,
  Sparkles,
  ArrowRight,
  Users,
  Car,
  Footprints,
  Home as HomeIcon,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Quebrada a tu ritmo",
  description:
    "Planificador cartográfico de expediciones para la Quebrada de Humahuaca. Diseñe su itinerario con adaptación gradual a la altitud, logística verificada y protocolos de altura.",
};

interface NavLink {
  href: string;
  label: string;
}

const NAV_LINKS: NavLink[] = [
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#estrategias", label: "Estrategias" },
  { href: "#perfiles", label: "Perfiles" },
  { href: "#verificacion", label: "Verificación" },
];

interface TrustBadge {
  icon: LucideIcon;
  iconColor: "text-primary" | "text-accent" | "text-secondary";
  bgColor: "bg-primary/10" | "bg-accent/10" | "bg-secondary/10";
  borderColor: "border-primary/30" | "border-accent/30" | "border-secondary/30";
  title: string;
  description: string;
}

const TRUST_BADGES: TrustBadge[] = [
  {
    icon: MapPin,
    iconColor: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
    title: "Validación Local",
    description:
      "Itinerarios diseñados en colaboración directa con comunidades de Purmamarca, Tilcara y Humahuaca.",
  },
  {
    icon: Mountain,
    iconColor: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/30",
    title: "Precisión de Terreno",
    description:
      "Datos cartográficos actualizados sobre estado de rutas, huellas de altura y pasos cordilleranos.",
  },
  {
    icon: Shield,
    iconColor: "text-secondary",
    bgColor: "bg-secondary/10",
    borderColor: "border-secondary/30",
    title: "Protocolos de Altura",
    description:
      "Monitoreo preventivo de la fatiga de altura con curvas de ascenso optimizadas para cada viajero.",
  },
];

interface Step {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: "PASO 01",
    icon: Compass,
    title: "Cuente su viaje",
    description:
      "Defina sus días disponibles, ritmo deseado de caminata o trayectos en vehículo, y preferencias de descanso en cada localidad.",
  },
  {
    number: "PASO 02",
    icon: Route,
    title: "Compare estrategias",
    description:
      "Analice opciones de pernocte adaptadas al mal de altura, perfiles de elevación diaria y distancias reales entre poblados históricos.",
  },
  {
    number: "PASO 03",
    icon: MapPin,
    title: "Reciba su itinerario",
    description:
      "Obtenga una guía detallada descargable con coordenadas offline, contactos de emergencia locales y recomendaciones gastronómicas.",
  },
];

interface Profile {
  icon: LucideIcon;
  title: string;
  description: string;
}

const PROFILES: Profile[] = [
  {
    icon: Car,
    title: "Viajeros sin auto propio",
    description:
      "Logística precisa de transporte público, traslados compartidos y puntos de conexión en Purmamarca y Tilcara.",
  },
  {
    icon: Users,
    title: "Familias y Adultos Mayores",
    description:
      "Ascensos controlados y paradas frecuentes para minimizar el impacto de la altura en mayores de edad y niños.",
  },
  {
    icon: Footprints,
    title: "Senderistas y Altura",
    description:
      "Rutas exigentes hacia Salinas Grandes, Hornocal y caminatas de altura con métricas exactas de desnivel.",
  },
  {
    icon: HomeIcon,
    title: "Primera vez en el NOA",
    description:
      "Guía introductoria paso a paso para entender los tiempos, la cultura local y la geografía quebradeña.",
  },
];

interface LodgingOption {
  name: string;
  altitude: string;
  badge: string;
  badgeColor: string;
  description: string;
}

const LODGING_OPTIONS: LodgingOption[] = [
  {
    name: "Purmamarca",
    altitude: "2.324 msnm",
    badge: "Ideal Inicio",
    badgeColor: "bg-primary/10 text-primary border-primary/30",
    description:
      "Excelente punto de partida para una aclimatación suave al pie del Cerro de los Siete Colores.",
  },
  {
    name: "Tilcara",
    altitude: "2.465 msnm",
    badge: "Centro Operativo",
    badgeColor: "bg-accent/10 text-accent border-accent/30",
    description:
      "El corazón cultural y gastronómico, ideal para base de operaciones durante varias noches.",
  },
  {
    name: "Humahuaca",
    altitude: "3.012 msnm",
    badge: "Alta Puna",
    badgeColor: "bg-secondary/10 text-secondary border-secondary/30",
    description:
      "Mayor altitud, recomendada para las últimas jornadas antes de visitar el Hornocal o Iruya.",
  },
];

export default function Home() {
  return (
    <>
      {/* TopNavBar */}
      <header className=" bg-base-100 backdrop-blur-md sticky top-0 z-50 border-b border-base-300/30">
        <div className="flex justify-between items-center w-full px-6 md:px-12 max-w-7xl mx-auto h-20">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-headline-sm font-semibold tracking-tight text-base-content"
            >
              <Image
                src="/icon0.svg"
                alt="Quebrada a tu ritmo"
                width={192}
                height={30
                }
                className="inline-block mr-2"
              />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base-content/70 hover:text-base-content transition-colors pb-1 text-label-md font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/planner"
              className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-primary-container text-on-primary-container font-semibold text-label-md transition duration-200 hover:bg-primary/90 active:scale-95"
            >
              Planificar mi viaje
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="relative px-6 md:px-12 py-16 md:py-24 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column */}
            <div className="lg:col-span-6 flex flex-col items-start gap-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-base-content text-balance">
                Planifique la Quebrada a su ritmo
              </h1>
              <p className="text-lg text-base-content/70 max-w-xl leading-relaxed">
                Diseñe su itinerario por los paisajes de la Quebrada de Humahuaca con adaptación gradual a la
                altitud, cartografía de precisión y logística verificada para una travesía segura y sin contratiempos.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href="/planner"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-primary-container text-on-primary-container font-semibold text-base transition duration-200 hover:bg-primary/90 active:scale-95 shadow-lg shadow-primary-container/10"
                >
                  <Sparkles className="size-4" aria-hidden="true" />
                  Planificar mi viaje
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href="#estrategias"
                  className="inline-flex items-center justify-center px-6 py-4 rounded-lg border border-base-300/50 text-base-content hover:bg-base-200 transition duration-200 text-base"
                >
                  Ver protocolos de altitud
                </Link>
              </div>
            </div>

            {/* Right Column: Image with Badges */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-xl overflow-hidden border border-base-300/40 shadow-2xl bg-base-100 aspect-[4/3] md:aspect-[16/10]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" aria-hidden="true" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Mountain className="size-24 text-base-300/50" aria-hidden="true" />
                </div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589308078059-be1415cbc4d8?w=1200&q=80')] bg-cover bg-center" aria-hidden="true" />
                {/* Glassmorphism Badge 1 */}
                <div className="absolute top-6 left-6 px-4 py-2.5 rounded-lg bg-base-100/80 backdrop-blur-md border border-base-300/30 flex items-center gap-3 shadow-lg">
                  <Sparkles className="size-5 text-primary" aria-hidden="true" />
                  <div>
                    <div className="text-label-md font-medium text-base-content">98% rutas</div>
                    <div className="text-caption text-base-content/70">Verificadas por lugareños</div>
                  </div>
                </div>
                {/* Glassmorphism Badge 2 */}
                <div className="absolute bottom-6 right-6 px-4 py-2.5 rounded-lg bg-base-100/80 backdrop-blur-md border border-base-300/30 flex items-center gap-3 shadow-lg">
                  <Shield className="size-5 text-accent" aria-hidden="true" />
                  <div>
                    <div className="text-label-md font-medium text-base-content">4.350 msnm</div>
                    <div className="text-caption text-base-content/70">Hornocal máx.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges Section */}
        <section id="verificacion" className="border-y border-base-300/20 bg-base-200/50 py-12 px-6 md:px-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {TRUST_BADGES.map((badge) => (
              <div
                key={badge.title}
                className={`flex items-start gap-4 p-4 rounded-xl bg-base-100 border ${badge.borderColor} ${badge.bgColor}`}
              >
                <div className={`p-3 rounded-lg ${badge.iconColor}`}>
                  <badge.icon className="size-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-headline-sm font-semibold text-base-content mb-1">
                    {badge.title}
                  </h3>
                  <p className="text-sm text-base-content/70">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Three Steps Section */}
        <section id="como-funciona" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-label-sm font-medium text-primary uppercase tracking-wider mb-2 block">
              Metodología de viaje
            </span>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-base-content">
              Cómo funciona nuestra planificación
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="p-8 rounded-xl bg-base-100 border border-base-300/30 relative flex flex-col justify-between"
              >
                <div>
                  <div className="text-primary font-mono text-label-sm mb-4">{step.number}</div>
                  <h3 className="text-headline-md font-semibold text-base-content mb-3">
                    {step.title}
                  </h3>
                  <p className="text-base text-base-content/70">{step.description}</p>
                </div>
                <div className="pt-8 flex items-center justify-between text-base-content/40">
                  <step.icon className="size-6" aria-hidden="true" />
                  <span className="text-caption">{step.number.split(" ")[1]} / 03</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Profiles Section */}
        <section id="perfiles" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-label-sm font-medium text-primary uppercase tracking-wider mb-2 block">
              Adaptabilidad
            </span>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-base-content">
              Perfiles de viaje optimizados
            </h2>
            <p className="mt-3 text-base-content/70">
              Cada viajero requiere una estrategia altitudinal y logística única.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROFILES.map((profile) => (
              <div
                key={profile.title}
                className="bg-base-100 border border-base-300/30 rounded-xl p-6 flex flex-col gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="p-3 rounded-lg bg-primary/10 text-primary">
                    <profile.icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-headline-sm font-semibold text-base-content">
                    {profile.title}
                  </h3>
                </div>
                <p className="text-sm text-base-content/70">{profile.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Lodging Strategy Matrix */}
        <section id="estrategias" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-label-sm font-medium text-primary uppercase tracking-wider mb-2 block">
              Estrategia de Pernocte
            </span>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-base-content">
              Matriz decisional de hospedaje
            </h2>
            <p className="mt-3 text-base-content/70">
              ¿Dónde dormir? Compare las altitudes clave para su aclimatación.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LODGING_OPTIONS.map((option) => (
              <div
                key={option.name}
                className="bg-base-100 border border-base-300/30 rounded-xl p-6 flex flex-col gap-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-headline-sm font-semibold text-base-content">
                      {option.name}
                    </h3>
                    <span className="text-caption text-primary">{option.altitude}</span>
                  </div>
                  <span className={`text-label-sm px-2.5 py-1 rounded font-semibold border ${option.badgeColor}`}>
                    {option.badge}
                  </span>
                </div>
                <p className="text-sm text-base-content/70">{option.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative px-6 md:px-12 py-16 max-w-3xl mx-auto" id="planificar">
          <div className="relative flex flex-col items-center text-center gap-6 rounded-2xl bg-base-200/50 border border-base-300/50 p-8 sm:p-12">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5" aria-hidden="true" />
            <div className="relative flex flex-col gap-4 max-w-xl">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-base-content">
                Comience a planificar hoy mismo
              </h2>
              <p className="text-base-content/70 leading-relaxed">
                Diseñe su expedición a medida con nuestra herramienta de cálculo cartográfico y altitudinal.
              </p>
              <Link
                href="/planner"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-primary-container text-on-primary-container font-semibold text-base transition duration-200 hover:bg-primary/90 active:scale-95 shadow-md"
              >
                <Sparkles className="size-4 group-hover:animate-pulse" aria-hidden="true" />
                Crear itinerario personalizado
                <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
              <p className="text-sm text-base-content/50">
                Sin compromiso. Ajuste y vuelva a comparar cuantas veces quiera.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-base-200/50 border-t border-base-300/20">
        <div className="w-full px-6 md:px-12 py-16 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="text-headline-sm font-semibold text-primary"
            >
              Quebrada a tu ritmo
            </Link>
            <p className="text-caption text-base-content/60 max-w-md">
              © 2025 Quebrada a tu ritmo. Planificación cartográfica y expediciones en Jujuy, Argentina. Todos los
              derechos reservados.
            </p>
          </div>
          <div className="flex flex-wrap gap-6">
            <Link href="#" className="text-sm text-base-content/70 hover:text-primary transition-colors">
              Términos de servicio
            </Link>
            <Link href="#" className="text-sm text-base-content/70 hover:text-primary transition-colors">
              Protocolos de altitud
            </Link>
            <Link href="#" className="text-sm text-base-content/70 hover:text-primary transition-colors">
              Verificación de guías
            </Link>
            <Link href="#" className="text-sm text-base-content/70 hover:text-primary transition-colors">
              Contacto
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
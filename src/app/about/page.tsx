
import Image from "next/image";

export const metadata = {
    title: "Sobre mí | Arody",
    description: "Fotógrafo, ingeniero y creativo.",
};

export default function AboutPage() {
    return (
        <div className="max-w-3xl mx-auto px-6 pb-20">
            <h1 className="text-4xl md:text-5xl font-serif italic mb-12 text-center">Sobre mí</h1>

            <div className="prose prose-lg mx-auto font-serif text-gray-800 leading-relaxed">
                <p>
                    Soy Arody. Casado con Marisela. Fotógrafo por obsesión visual, ingeniero por deformación profesional y creativo porque no me quedó de otra.
                </p>
                <p>
                    Me dedico a capturar imágenes, pero en realidad paso gran parte del tiempo pensando: en la luz, en los procesos, en por qué algo funciona… y en cómo mejorarlo. Si una foto no tiene intención, emoción o una buena historia detrás, probablemente la rehaga (o la descarte sin remordimientos).
                </p>
                <p>
                    Vengo del mundo de la tecnología, los sistemas y la optimización, así que sí: puedo hablar de composición, color y atmósfera… pero también de flujos, estructura y estrategia. Para mí, la creatividad sin orden es caos, y el orden sin creatividad es aburrimiento puro.
                </p>
                <p>
                    Trabajo con fotografía editorial, de producto y proyectos visuales donde el detalle importa. Me gusta lo limpio, lo atmosférico, lo que se siente bien antes de explicarse. Si una imagen provoca algo —aunque no sepas qué—, vamos por buen camino.
                </p>
                <p>
                    Este blog existe porque no todo cabe en una foto. Aquí comparto procesos, aprendizajes, errores, ideas que funcionan y otras que parecían brillantes hasta que no lo fueron. Spoiler: casi siempre se aprende más de las segundas.
                </p>
                <p>
                    Cuando no estoy tomando fotos, probablemente esté diseñando sistemas, creando proyectos, pensando demasiado o buscando cómo hacer las cosas mejor sin perder el alma en el intento.
                </p>
                <p className="font-bold">
                    Bienvenido. Mira con calma.<br/>
                    Lo demás se va enfocando solo.
                </p>
            </div>

            <div className="mt-16 mb-12">
                <div className="relative aspect-[3/4] md:aspect-[4/3] w-full group overflow-hidden">
                    <Image 
                        src="/arody-portrait.jpg" 
                        alt="Arody - Retrato" 
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 transition duration-700 ease-in-out"
                    />
                </div>
                <p className="text-center text-xs uppercase tracking-widest text-gray-400 mt-4">
                    Titulo de la imagen: Como núnca me verás en persona
                </p>
            </div>
        </div>
    );
}

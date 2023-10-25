import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export default async function handler(req, res) {
  const { folderDescription } = req.body;
  // const imageType = "realist painting";
  // "realist painting",
  // "impressionist painting",

  try {
    const chat_completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at designing images of places and describing them in less than 300 characters. You choose from a library of famous artists and styles to combine them in order to best capture the spirit of the subject. You always return answers with no explanation.",
        },
        {
          role: "user",
          content: `Describe an exciting, inspirational painting that captures the spirit of the following report: ${folderDescription}. The description will be used by dall-e to create an image for immersive context for the report. Return only the description and do not explain your answer. Choose 2-3 of the following artists to blend styles and collaborate to best describe the report. ${getArtKnowledge()}`,
        },
      ],
    });

    const folderImageResponse = chat_completion.choices[0].message.content;
    console.log("folderImageResponse2");
    console.log(folderImageResponse);
    return { folderImageResponse };
  } catch (error) {
    console.log("error");
    console.log(error);
    return console.log({ error });
  }
  // await saveToLinksTableFunction();
}

function getArtKnowledge() {
  return `
  Impressionism
  Artists: Claude Monet, Pierre-Auguste Renoir, Édouard Manet, Edgar Degas
  
  Action painting
  Artists: Jackson Pollock, Franz Kline, Norman Bluhm, James Brooks, Giovanni Enrico
  
  Cubism
  Artists: Pablo Picasso, Georges Braque, Salvador Dalí, Paul Cézanne, Juan Gris,
  
  Pointillism
  Artists: Georges Seurat, Vincent van Gogh, Paul Signac, Henri-Edmond Cross, 
  
  Abstract expressionism
  Artists: Jackson Pollock, Mark Rothko, Willem de Kooning, Helen Frankenthaler, 
  
  Surrealism
  Artists: Salvador Dalí, René Magritte, Pablo Picasso, André Breton, Frida Kahlo, 
  
  Pop art
  Artists: Andy Warhol, Roy Lichtenstein, Keith Haring, Richard Hamilton, David Hockney 
  
  Post-Impressionism
  Artists: Vincent van Gogh, Paul Cézanne, Paul Gauguin, Georges Seurat, Pablo Picasso 
  
  Fauvism
  Artists: Henri Matisse, André Derain, Georges Braque, Maurice de Vlaminck, Raoul Dufy 
  
  Realism
  Artists: Gustave Courbet, Jean-François Millet, Édouard Manet, Edward Hopper
  
  Expressionism
  Artists: Edvard Munch, Wassily Kandinsky, Emil Nolde, Ernst Ludwig Kirchner
  
  Photorealism
  Artists: Chuck Close, Richard Estes, Gerhard Richter, Vija Celmins, Duane Hanson 
  
  Minimalism
  Artists: Yayoi Kusama, Donald Judd, Frank Stella, Carl Andre, Dan Flavin, Sol LeWitt 
  
  Modern art
  Artists: Pablo Picasso, Claude Monet, Salvador Dalí, Andy Warhol, Jackson Pollock 
  
  Art Nouveau
  Artists: Alphonse Mucha, Gustav Klimt, Charles Rennie Mackintosh, Hector Guimard
  
  Rococo
  Artists: Jean-Honoré Fragonard, Jean-Antoine Watteau, François Boucher, 
  
  Art Deco
  Artists: Erté, Tamara de Lempicka, Jean Dunand, Émile-Jacques Ruhlmann, 
  
  Neoclassicism
  Artists: Jacques-Louis David, Jean Auguste Dominique Ingres, Angelica Kauffman 
  
  Futurism
  Artists: Umberto Boccioni, Giacomo Balla, Gino Severini, Carlo Carrà
  
  Dada
  Artists: Marcel Duchamp`;
}

import axios from "axios";
import re from "cheerio";
import { JSDOM } from 'jsdom';

/**
 * Obtiene y concatena el contenido de todas las etiquetas <script> de una URL.
 * @param {string} url La URL de la página a analizar.
 * @returns {Promise<string>} El contenido de los scripts.
 */
async function getScriptContent(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();
    // JSDOM es pesado, pero necesario si el contenido se genera dinámicamente.
    const { document } = new JSDOM(html).window;
    const scripts = document.querySelectorAll('script');
    return Array.from(scripts).map(script => script.innerHTML).join(' ');
  } catch (error) {
    console.error('Error en getScriptContent:', error);
    // Propagar el error para que la función que llama sepa que algo falló.
    throw error; 
  }
}

/**
 * Extrae los enlaces de descarga de PixelDrain (SUB y DUB) del texto de un script.
 * @param {string} scriptText El contenido del script a analizar.
 * @returns {{sub: string|null, dub: string|null}} Un objeto con los enlaces.
 */
function extractPixelDrainLinks(scriptText) {
  // Regex mejorada: busca directamente la clave "SUB" o "DUB" asociada a la URL de PDrain.
  // Es mucho más robusta que mirar 500 caracteres hacia atrás.
  const regex = /"(SUB|DUB)":\[{[^}]+?"PDrain",url:"(https:\/\/pixeldrain\.com\/u\/[^"?"]+)/g;
  const links = {
    sub: null,
    dub: null,
  };

  let match;
  while ((match = regex.exec(scriptText)) !== null) {
    const lang = match[1].toLowerCase(); // 'sub' o 'dub'
    const url = match[2];
    const apiLink = `https://pixeldrain.com/api/file/${url.split('/u/')[1]}`;
    
    if (!links[lang]) { // Asigna solo la primera que encuentre para cada idioma
      links[lang] = apiLink;
    }
  }

  return links;
}

/**
 * Obtiene los enlaces de descarga para un único episodio.
 * @param {string} episodeUrl La URL del episodio en animeav1.com.
 * @returns {Promise<{title: string, dl: {sub: string|null, dub: string|null}}>}
 */
async function getDownloadLinks(episodeUrl) {
  try {
    const scriptContent = await getScriptContent(episodeUrl);
    const links = extractPixelDrainLinks(scriptContent);
    
    // Para obtener el título, podemos hacer una petición ligera en vez de cargar Cheerio
    const pageResponse = await axios.get(episodeUrl);
    const $ = cheerio.load(pageResponse.data);
    const title = $('title').text().trim().replace(/Sub Español - Animes Online en HD \| AnimeAV1/, '').trim();

    return { title, dl: links };
  } catch (err) {
    console.error(`Error obteniendo enlaces de ${episodeUrl}:`, err);
    // Retorna un objeto de error claro.
    return { error: 'No se pudieron obtener los enlaces de descarga.', details: err.message };
  }
}

/**
 * Obtiene los detalles de una serie de anime.
 * @param {string} url La URL de la serie.
 * @returns {Promise<object>}
 */
async function detail(url) {
  const base = "https://animeav1.com";
  try {
    const { data: html } = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });
    const $ = cheerio.load(html);

    const episodes = [];
    $('article.group\\/item').each((_, el) => {
      episodes.push({
        ep: $(el).find('.text-lead').first().text().trim(),
        img: $(el).find('img').attr('src'),
        link: base + $(el).find('a').attr('href'),
      });
    });

    return {
      title: $('h1').first().text().trim(),
      altTitle: $('h2').first().text().trim(),
      description: $('.entry p').text().trim(),
      rating: $('.ic-star-solid .text-2xl').first().text().trim(),
      votes: $('.ic-star-solid .text-xs span').first().text().trim(),
      cover: $('figure img[alt$="Poster"]').attr('src'),
      genres: $('a.btn[href*="catalogo?genre="]').map((_, el) => $(el).text().trim()).get(),
      episodes: episodes.reverse(), // Los episodios suelen estar en orden inverso en la web
      total: episodes.length,
    };
  } catch (err) {
    console.error('Error en detail:', err);
    return { error: err.message };
  }
}

/**
 * Busca animes por un término de búsqueda.
 * @param {string} query El título del anime a buscar.
 * @returns {Promise<Array<object>>}
 */
async function search(query) {
  const base = "https://animeav1.com";
  try {
    const res = await fetch(`${base}/catalogo?search=${encodeURIComponent(query)}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    return $("article").map((_, el) => ({
      title: $(el).find("h3").text().trim(),
      link: base + $(el).find("a").attr("href"),
      img: $(el).find("img").attr("src"),
    })).get();
  } catch (error) {
    console.error('Error en search:', error);
    return [];
  }
}

export { getDownloadLinks, detail, search };
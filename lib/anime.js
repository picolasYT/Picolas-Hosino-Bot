// /lib/anime.js

import * as cheerio from "cheerio";
import { JSDOM } from 'jsdom';

const BASE_URL = "https://animeav1.com";

// Función auxiliar para extraer el contenido de los scripts en una página
async function getScriptContent(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();
    const { document } = new JSDOM(html).window;
    const scripts = document.querySelectorAll('script');
    return Array.from(scripts).map(script => script.innerHTML).join(' ');
  } catch (error) {
    console.error('Error fetching script content:', error);
    return ''; // Devolver string vacío en caso de error para no detener el flujo
  }
}

// Extrae los enlaces de descarga de PixelDrain del texto de los scripts
function extractPixelDrainLinks(scriptContent) {
  const regex = /"PDrain",url:"(https:\/\/pixeldrain\.com\/u\/([^"?"]+))/g;
  const links = { sub: null, dub: null };
  const downloadInfoIndex = scriptContent.indexOf('downloads:{');

  if (downloadInfoIndex === -1) {
    return links;
  }

  const relevantText = scriptContent.substring(downloadInfoIndex);
  let match;
  while ((match = regex.exec(relevantText)) !== null) {
    const url = match[1];
    const id = match[2];
    const context = relevantText.substring(Math.max(0, match.index - 500), match.index).toUpperCase();

    // Construimos la URL de descarga directa
    const downloadUrl = `https://pixeldrain.com/api/file/${id}/download`;

    if (context.includes("SUB") && !links.sub) {
      links.sub = downloadUrl;
    } else if (context.includes("DUB") && !links.dub) {
      links.dub = downloadUrl;
    }
  }
  return links;
}

// Obtiene los enlaces de descarga para un único episodio
async function download(episodeUrl) {
  try {
    const scriptContent = await getScriptContent(episodeUrl);
    if (!scriptContent) throw new Error('Could not retrieve script content.');
    
    const { data: html } = await (await fetch(episodeUrl)).text();
    const $ = cheerio.load(html);
    let title = $('title').text().trim();

    const links = extractPixelDrainLinks(scriptContent);
    return { title, dl: links };
  } catch (err) {
    console.error(`Failed to download from ${episodeUrl}:`, err);
    return { error: 'Failed to fetch or parse page', details: err.message };
  }
}

// Obtiene los detalles de una serie (muy optimizado)
async function detail(url) {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('h1').first().text().trim();
    const altTitle = $('h2').first().text().trim();
    const description = $('.entry p').text().trim();
    const rating = $('.ic-star-solid .text-2xl').first().text().trim();
    const votes = $('.ic-star-solid .text-xs span').first().text().trim();
    const cover = $('figure img[alt$="Poster"]').attr('src');
    const backdrop = $('figure img[alt$="Backdrop"]').attr('src');
    const genres = $('a.btn[href*="catalogo?genre="]').map((_, el) => $(el).text().trim()).get();

    const episodes = [];
    $('article.group\\/item').each((_, el) => {
      const $el = $(el);
      const epNum = $el.find('.text-lead').first().text().trim().match(/\d+/)[0]; // Extraer solo el número
      const img = $el.find('img').attr('src');
      const link = BASE_URL + $el.find('a').attr('href');
      
      // OPTIMIZACIÓN: Extraemos los idiomas disponibles desde aquí
      const availableLangs = [];
      if ($el.find('span.bg-secondary:contains("SUB")').length) {
        availableLangs.push('sub');
      }
      if ($el.find('span.bg-secondary:contains("LAT")').length) {
          availableLangs.push('dub');
      }
      
      episodes.push({ ep: epNum, img, link, lang: availableLangs });
    });

    return {
      title,
      altTitle,
      description,
      rating,
      votes,
      cover,
      backdrop,
      genres,
      episodes,
      total: episodes.length,
    };
  } catch (err) {
    console.error(`Failed to get details from ${url}:`, err);
    return { error: err.message };
  }
}

// Busca animes por título
async function search(query) {
  try {
    const searchUrl = `${BASE_URL}/catalogo?search=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const html = await response.text();
    const $ = cheerio.load(html);

    const results = $("article").map((_, el) => {
      const $el = $(el);
      return {
        title: $el.find("h3").text().trim(),
        link: BASE_URL + $el.find("a").attr("href"),
        img: $el.find("img").attr("src"),
      };
    }).get();

    return results;
  } catch(err) {
    console.error(`Failed to search for "${query}":`, err);
    return [];
  }
}

export { download, detail, search };
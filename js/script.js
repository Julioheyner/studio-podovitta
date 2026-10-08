const header = document.getElementById('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}, { passive: true });

const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
    backToTop.classList.toggle('show', window.scrollY > 500);
}, { passive: true });
backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    navMenu.classList.toggle('active');
    const icon = menuToggle.querySelector('i');
    if (navMenu.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
        document.body.style.overflow = 'hidden';
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        document.body.style.overflow = '';
    }
});

document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        document.body.style.overflow = '';
    });
});

document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('active') && 
        !navMenu.contains(e.target) && 
        !menuToggle.contains(e.target)) {
        navMenu.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        document.body.style.overflow = '';
    }
});

const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
} else {
    revealElements.forEach(el => el.classList.add('visible'));
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '') return;

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const offsetTop = target.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

/* ===== LIGHTBOX, VÍDEOS E TRAJETÓRIA ===== */
(function () {
    const lb = document.getElementById('lightbox');
    const career = document.getElementById('career');
    const body = lb.querySelector('.lb-body');
    const cap = lb.querySelector('.lb-cap');
    const lbCredit = lb.querySelector('.lb-credit');
    function setCredit(src) {
        if (!src) { lbCredit.hidden = true; return; }
        lbCredit.href = src.href; lbCredit.innerHTML = src.innerHTML;
        lbCredit.setAttribute('aria-label', src.getAttribute('aria-label') || ''); lbCredit.hidden = false;
    }
    const photos = [...document.querySelectorAll('.g-item')];
    let idx = 0, opener = null, current = null;

    function lock(el, on) { el.hidden = !on; document.body.classList.toggle('ov-open', on); }
    function open(el, trigger) { opener = trigger; current = el; lock(el, true); const c = el.querySelector('[data-close]'); if (c) c.focus(); }
    function close() { if (!current) return; const v = body.querySelector('video'); if (v) v.pause(); body.innerHTML = ''; lock(current, false); current = null; if (opener) opener.focus(); }

    function showPhoto(i) {
        idx = (i + photos.length) % photos.length;
        const f = photos[idx];
        body.innerHTML = '<img src="' + f.dataset.full + '" alt="" decoding="async">';
        [idx + 1, idx - 1].forEach(n => { new Image().src = photos[(n + photos.length) % photos.length].dataset.full; });
        body.firstChild.onerror = function () { this.src = f.querySelector('img') ? f.querySelector('img').src : ''; };
        cap.textContent = f.dataset.cap;
        setCredit(f.querySelector('.credit'));
    }
    photos.forEach((f, i) => {
        const go = () => { lb.classList.remove('single'); showPhoto(i); open(lb, f); };
        f.addEventListener('click', e => { if (e.target.closest('.credit')) return; go(); });
        f.addEventListener('keydown', e => { if (e.target.closest('.credit')) return; if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    lb.querySelector('.prev').addEventListener('click', () => showPhoto(idx - 1));
    lb.querySelector('.next').addEventListener('click', () => showPhoto(idx + 1));
    let sx = null;
    lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => { if (sx === null || lb.classList.contains('single')) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 50) showPhoto(idx + (dx < 0 ? 1 : -1)); });

    document.querySelectorAll('.v-card').forEach(card => {
        card.addEventListener('keydown', e => { if (e.target.closest('.credit')) return; if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); } });
        card.addEventListener('click', e => {
            if (e.target.closest('.credit')) return;
            lb.classList.add('single');
            setCredit(card.querySelector('.credit'));
            body.innerHTML = '';
            const v = document.createElement('video');
            v.controls = true; v.autoplay = true; v.playsInline = true; v.preload = 'auto';
            v.setAttribute('controlsList', 'nodownload');
            v.addEventListener('loadedmetadata', () => {
                if (!v.videoWidth || !v.videoHeight) return;
                const ar = v.videoWidth / v.videoHeight;
                v.style.setProperty('--ar', ar.toFixed(4));
                v.classList.toggle('is-portrait', ar < 1);
            });
            v.addEventListener('error', () => { body.innerHTML = '<p class="lb-msg">Vídeo indisponível no momento.</p>'; });
            v.src = card.dataset.video;
            body.appendChild(v);
            // Inicia dentro do gesto de clique; se o navegador bloquear com som, tenta sem som
            const start = () => {
                const pr = v.play();
                if (pr && pr.catch) pr.catch(() => { v.muted = true; v.play().catch(() => {}); });
            };
            start();
            cap.textContent = card.dataset.cap;
            open(lb, card);
        });
    });

    document.getElementById('openCareer').addEventListener('click', function () { open(career, this); });

    [lb, career].forEach(o => o.addEventListener('click', e => { if (e.target === o || e.target.closest('[data-close]')) close(); }));
    document.addEventListener('keydown', e => {
        if (!current) return;
        if (e.key === 'Escape') close();
        if (current === lb && !lb.classList.contains('single')) {
            if (e.key === 'ArrowLeft') showPhoto(idx - 1);
            if (e.key === 'ArrowRight') showPhoto(idx + 1);
        }
    });
})();

/* ===== CONTADORES, INDICADORES DO CARROSSEL E BLOG ===== */
(function () {
    // Contadores: o HTML já traz o valor final; a animação só roda se o movimento for permitido
    const counts = document.querySelectorAll('.count');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window);
    if (!still) {
        const fmt = (el, v) => v.toFixed(+el.dataset.dec || 0) + (el.dataset.suffix || '');
        counts.forEach(el => { el.textContent = fmt(el, 0); });
        const run = el => {
            const to = +el.dataset.to, t0 = performance.now(), d = 1800;
            const step = t => { const p = Math.min((t - t0) / d, 1); el.textContent = fmt(el, to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
            requestAnimationFrame(step);
        };
        const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.querySelectorAll('.count').forEach(run); io.unobserve(e.target); } }), { threshold: 0.4 });
        document.querySelectorAll('.hero-stats').forEach(el => io.observe(el));
    }

    // Indicadores (bolinhas) dos carrosséis mobile
    document.querySelectorAll('.g-grid, .v-grid').forEach(c => {
        const n = c.children.length, d = document.createElement('div');
        d.className = 'snap-dots'; d.setAttribute('aria-hidden', 'true'); d.innerHTML = '<i></i>'.repeat(n); c.after(d);
        const set = () => { const m = c.scrollWidth - c.clientWidth, i = m > 0 ? Math.round(c.scrollLeft / m * (n - 1)) : 0; [...d.children].forEach((x, k) => x.classList.toggle('on', k === i)); };
        c.addEventListener('scroll', set, { passive: true }); set();
        // Passagem automática no mobile: pausa ao tocar, fora da tela, com modal aberto ou se o usuário reduz animações
        const mq = window.matchMedia('(max-width: 860px)'), calm = window.matchMedia('(prefers-reduced-motion: reduce)');
        let visible = !('IntersectionObserver' in window), hold = 0;
        const mid = r => r.left + r.width / 2;
        const current = () => { const m = mid(c.getBoundingClientRect()); let b = 0, best = Infinity; [...c.children].forEach((k, j) => { const q = Math.abs(mid(k.getBoundingClientRect()) - m); if (q < best) { best = q; b = j; } }); return b; };
        const next = () => {
            if (!mq.matches || calm.matches || !visible || document.hidden || document.body.classList.contains('ov-open') || Date.now() < hold || c.scrollWidth <= c.clientWidth + 2) return;
            const kids = [...c.children], k = kids[(current() + 1) % kids.length];
            c.scrollTo({ left: c.scrollLeft + mid(k.getBoundingClientRect()) - mid(c.getBoundingClientRect()), behavior: 'smooth' });
        };
        ['touchstart', 'pointerdown', 'wheel', 'focusin'].forEach(ev => c.addEventListener(ev, () => { hold = Date.now() + 6000; }, { passive: true }));
        if (!visible) new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; }), { threshold: 0.4 }).observe(c);
        setInterval(next, 3500);
    });

    // BLOG: a profissional edita apenas esta lista (img, tag, date, title, excerpt, body em HTML simples)
    const POSTS = [
        {
            "img": "img/blog/unha-encravada.jpg",
            "fallback": "img/blog/unha-encravada.jpg",
            "credit": {"by": "kroshka__nastya no Magnific", "url": "https://www.magnific.com/br/fotos-gratis/processo-de-pedicure-home-salon-pedicure-tratamento-de-pes-e-unhas-o-processo-de-pedicure-profissional-mestre-em-luvas-azuis-fazer-pedicure_11402494.htm#fromView=search&page=1&position=0&uuid=fa1c1f4a-05fa-40f0-92a4-96f482ba96a6&track=ais_hybrid&query=p%C3%A9s+unha+encravada"},
            "icon": "fa-notes-medical",
            "tag": "Unhas",
            "date": "28 set 2026",
            "read": "5 min de leitura",
            "title": "Unha encravada: como evitar e quando procurar ajuda",
            "excerpt": "A unha encravada começa discreta, com uma sensibilidade na lateral do dedo, e pode evoluir para dor forte, inchaço e infecção. Corte errado, calçado apertado e até a forma de pisar contribuem. Entenda as causas, os cuidados do dia a dia e o momento certo de buscar a podóloga.",
            "body": "<p>A unha encravada (onicocriptose) acontece quando a lateral ou a ponta da unha cresce para dentro da pele e a machuca. O dedão é o mais afetado. No início há apenas desconforto ao calçar o sapato; com o tempo surgem vermelhidão, inchaço e dor ao toque, e a região pode inflamar ou infeccionar.</p><h4>Por que ela aparece</h4><ul><li>Corte arredondado ou muito rente, que deixa a ponta da unha livre para crescer para dentro.</li><li>Calçados apertados, de bico fino, ou meias que comprimem os dedos.</li><li>Pancadas e pressão repetida, comuns em quem corre, joga futebol ou passa muitas horas em pé.</li><li>Unhas muito curvas (em telha) ou espessadas, por herança familiar, micose ou trauma.</li><li>Suor excessivo e pés úmidos, que amolecem a pele e facilitam a penetração da unha.</li></ul><h4>Como evitar</h4><ul><li>Corte a unha reta, deixando os cantos visíveis e a ponta um pouco acima da pele.</li><li>Use alicate limpo e adequado; lixe levemente as quinas depois do corte.</li><li>Escolha sapatos com espaço para os dedos se mexerem e troque os que machucam.</li><li>Mantenha os pés limpos, bem secos e hidratados, sem deixar a pele ao redor ressecada.</li><li>Evite arrancar \"pelinhas\" e cantinhos de unha com a mão.</li></ul><h4>Sinais de alerta</h4><ul><li>Dor que aumenta ou latejante, principalmente à noite.</li><li>Pele vermelha, quente e inchada ao redor da unha.</li><li>Secreção, mau cheiro ou tecido que cresce sobre a unha (granuloma).</li><li>Febre ou vermelhidão que se espalha pelo pé.</li></ul><h4>O que a podóloga pode fazer</h4><p>Na avaliação, a profissional examina o grau do problema e remove com segurança a parte da unha que machuca, alivia a pressão e orienta a higiene. Em casos recorrentes, técnicas como órtese de unha (correção com fio ou fita) ajudam a guiar o crescimento da unha. Quando há infecção importante, o encaminhamento ao médico pode ser necessário.</p><h4>O que não fazer em casa</h4><p>Não tente cortar fundo no canto da unha nem usar objetos pontiagudos: isso costuma piorar a inflamação e favorece infecção. Quem tem diabetes, problemas de circulação ou perda de sensibilidade nos pés deve procurar atendimento ao primeiro sinal, sem tentar resolver sozinho.</p>"
        },
        {
            "img": "img/blog/pe-diabetico.jpg",
            "fallback": "img/blog/pe-diabetico.jpg",
            "credit": {"by": "Magnific", "url": "https://www.magnific.com/br/fotos-gratis/um-medico-a-tomar-conta-de-uma-crianca-afro-americana_133620674.htm#fromView=search&page=5&position=0&uuid=3170a464-2e1a-4b2e-bb3d-b01a44bca01d&track=ais_hybrid&query=Pe+diabetico"},
            "icon": "fa-shield-heart",
            "tag": "Saúde",
            "date": "15 set 2026",
            "read": "6 min de leitura",
            "title": "Pés e diabetes: o que observar todos os dias",
            "excerpt": "O diabetes pode reduzir a sensibilidade e a circulação dos pés, e uma pequena ferida pode passar despercebida e se agravar. Uma rotina de 2 minutos por dia ajuda a perceber mudanças cedo. Veja o que olhar, o que evitar e quando procurar atendimento.",
            "body": "<p>Com o diabetes, os níveis elevados de açúcar no sangue podem, ao longo do tempo, afetar os nervos (neuropatia) e os vasos sanguíneos dos pés. Resultado: a pessoa sente menos dor, calor e frio, e a cicatrização fica mais lenta. Um calo, uma bolha ou um corte pequeno pode passar despercebido e evoluir para uma ferida difícil de tratar. Por isso, prevenção e observação diária fazem toda a diferença.</p><h4>Rotina diária de 2 minutos</h4><ul><li>Olhe a sola, o calcanhar, os dedos e o espaço entre eles. Se precisar, use um espelho ou peça ajuda a alguém.</li><li>Procure bolhas, cortes, rachaduras, calos, manchas, unhas machucadas e mudança de cor.</li><li>Lave os pés com água morna (não quente) e sabonete neutro, e seque bem entre os dedos.</li><li>Hidrate o dorso e a sola, sem passar creme entre os dedos.</li></ul><h4>Calçados e meias</h4><ul><li>Prefira sapatos macios, fechados e com espaço para os dedos; experimente-os no fim do dia, quando o pé está mais inchado.</li><li>Olhe e passe a mão dentro do calçado antes de calçar, para checar pedrinhas ou costuras.</li><li>Use meias de algodão, sem elástico apertado e sem costuras grossas, trocadas todos os dias.</li><li>Evite andar descalço, inclusive dentro de casa, e não use bolsa de água quente nos pés.</li></ul><h4>Unhas e calos</h4><p>Corte as unhas retas e sem retirar os cantinhos. Se a visão estiver comprometida ou a unha estiver grossa, deixe esse cuidado com a podóloga. Evite lâminas, tesouras de ponta e removedores químicos de calos: eles podem ferir a pele sem você perceber.</p><h4>Procure avaliação sem demora se houver</h4><ul><li>Ferida que não melhora em poucos dias, bolha ou calo que dói.</li><li>Pé vermelho, quente, inchado ou com secreção.</li><li>Formigamento, queimação, dormência ou mudança de cor.</li><li>Unha encravada ou micose persistente.</li></ul><p>O acompanhamento regular com a podóloga complementa o cuidado com o seu médico e ajuda a detectar alterações cedo. Mantenha também o controle da glicemia conforme a orientação da sua equipe de saúde.</p>"
        },
        {
            "img": "img/blog/micose-nas-unhas.jpg",
            "fallback": "img/blog/micose-nas-unhas.jpg",
            "credit": {"by": "Magnific", "url": "https://www.magnific.com/br/fotos-gratis/processo-de-manicure-para-unhas_19332640.htm#fromView=search&page=1&position=0&uuid=08503d46-e069-42ad-90a2-478159669864&track=ais_hybrid&query=Micose+nas+unhas"},
            "icon": "fa-hand-sparkles",
            "tag": "Prevenção",
            "date": "02 set 2026",
            "read": "5 min de leitura",
            "title": "Micose nas unhas: como prevenir no dia a dia",
            "excerpt": "Coceira, descamação entre os dedos e unhas amareladas ou espessas podem indicar micose. Os fungos prosperam em ambientes quentes e úmidos e se espalham com facilidade. Veja como reconhecer os sinais, o que muda na rotina e por que não vale a pena se automedicar.",
            "body": "<p>A micose dos pés é causada por fungos que se desenvolvem na pele e nas unhas. Na pele ela é conhecida como pé de atleta (frieira); nas unhas, como onicomicose. Os fungos gostam de calor, umidade e pouco ar, condições comuns dentro de sapatos fechados, e passam de uma pessoa para outra em superfícies molhadas.</p><h4>Como reconhecer</h4><ul><li>Coceira, vermelhidão, descamação ou fissuras, principalmente entre os dedos.</li><li>Pele da sola seca e com escamas finas, às vezes com bolhinhas.</li><li>Unhas amareladas, esbranquiçadas, mais grossas, quebradiças ou que se soltam do leito.</li><li>Mau cheiro persistente nos pés.</li></ul><h4>Hábitos que protegem</h4><ul><li>Seque bem os pés após o banho, principalmente entre os dedos.</li><li>Troque as meias todos os dias, ou mais de uma vez se o pé suar muito; prefira algodão ou tecidos que absorvem a umidade.</li><li>Alterne os calçados e deixe-os arejar por 24 horas entre um uso e outro.</li><li>Use chinelo em vestiários, academias, piscinas e banheiros coletivos.</li><li>Não compartilhe toalhas, meias, calçados nem alicates e lixas.</li><li>Em salões, escolha profissionais que esterilizem os instrumentos entre os clientes.</li></ul><h4>Por que não se automedicar</h4><p>Muitas doenças parecem micose, como psoríase, eczema e alergias, e cada uma pede um tratamento diferente. Usar cremes ou esmaltes sem diagnóstico pode atrasar a melhora ou irritar a pele. A podóloga avalia o caso e, quando necessário, encaminha para o médico, que define o tratamento.</p><h4>Paciência com as unhas</h4><p>A unha leva meses para crescer. Mesmo com o tratamento correto, a aparência só melhora de forma gradual, à medida que a unha saudável substitui a afetada. Manter a rotina de cuidados evita que a micose volte.</p><h4>Quando procurar ajuda</h4><p>Se a coceira não passa, a pele rachar, houver dor, secreção, ou se você tiver diabetes ou problemas de circulação, busque avaliação o quanto antes.</p>"
        }
    ];
    const grid = document.getElementById('blogGrid'), ov = document.getElementById('post');
    if (!grid || !ov) return;
    const bad = "var f=this.dataset.f;this.onerror=function(){this.remove()};if(f){this.removeAttribute('srcset');this.src=f}else{this.remove()}";
    const rs = (u, w, e) => String(u).replace(/\.(jpe?g|png)$/i, "-" + w + "." + e);
    const imgAttrs = u => 'src="' + esc(rs(u, 800, "jpg")) + '" srcset="' + esc(rs(u, 480, "webp")) + ' 480w, ' + esc(rs(u, 800, "webp")) + ' 800w" sizes="(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 380px" width="800" height="533"';
    const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const crd = (p, cls) => p.credit ? '<a class="credit' + (cls || '') + '" href="' + esc(p.credit.url) + '" target="_blank" rel="noopener noreferrer" aria-label="Crédito: Imagem de ' + esc(p.credit.by) + ' (abre em nova aba)">Imagem de ' + esc(p.credit.by) + ' <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i></a>' : '';
    grid.innerHTML = POSTS.map((p, i) => '<div role="button" tabindex="0" class="b-card" data-i="' + i + '" aria-label="Ler: ' + esc(p.title) + '"><span class="b-img"><i class="fas ' + (p.icon || 'fa-leaf') + ' g-fallback"></i>' + (p.img ? '<img ' + imgAttrs(p.img) + ' data-f="' + esc(p.fallback || p.img) + '" alt="" loading="lazy" decoding="async" onerror="' + bad + '">' : '') + (p.img ? crd(p) : '') + '</span><span class="b-body"><span class="b-meta"><b class="b-tag">' + esc(p.tag) + '</b><span>' + esc(p.date) + '</span>' + (p.read ? '<span><i class="fas fa-clock"></i> ' + esc(p.read) + '</span>' : '') + '</span><strong>' + esc(p.title) + '</strong><span class="b-ex">' + esc(p.excerpt) + '</span><span class="b-more">Ler artigo <i class="fas fa-arrow-right"></i></span></span></div>').join('');
    let opener = null;
    const close = () => { ov.hidden = true; document.body.classList.remove('ov-open'); if (opener) opener.focus(); opener = null; };
    grid.addEventListener('keydown', e => {
        const b = e.target.closest('.b-card'); if (!b || e.target.closest('.credit')) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); b.click(); }
    });
    grid.addEventListener('click', e => {
        const b = e.target.closest('.b-card'); if (!b || e.target.closest('.credit')) return;
        const p = POSTS[+b.dataset.i];
        document.getElementById('postTitle').textContent = p.title;
        document.getElementById('postBody').innerHTML = (p.img ? '<img src="' + esc(p.img) + '" data-f="' + esc(p.fallback || '') + '" width="1200" height="800" alt="" decoding="async" onerror="' + bad + '">' : '') + (p.img ? crd(p, ' credit-inline') : '') + '<b class="b-tag">' + esc(p.tag) + '</b>' + p.body + '<div class="post-cta"><p>Ficou com alguma dúvida? Converse com a Podóloga Camila e agende sua avaliação.</p><a class="btn btn-whatsapp" href="https://wa.me/5511999999999?text=' + encodeURIComponent('Olá! Li o artigo "' + p.title + '" e gostaria de agendar uma avaliação.') + '" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> Agendar uma avaliação</a></div>';
        document.getElementById('postBody').scrollTop = 0;
        opener = b; ov.hidden = false; document.body.classList.add('ov-open'); ov.querySelector('[data-close]').focus();
    });
    ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !ov.hidden) close(); });
})();

/* Destaque do link da seção visível */
(function () {
    const links = [...document.querySelectorAll('.nav-menu a[href^="#"]')];
    if (!links.length || !('IntersectionObserver' in window)) return;
    const map = new Map();
    links.forEach(a => { const t = document.querySelector(a.getAttribute('href')); if (t) map.set(t, a); });
    const io = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(a => a.classList.toggle('is-active', a === map.get(e.target)));
    }), { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((a, t) => io.observe(t));
})();

/* ===== POLÍTICA DE PRIVACIDADE E TERMOS ===== */
(function () {
    const ov = document.getElementById('legal');
    const panes = [...ov.querySelectorAll('[data-pane]')];
    const title = document.getElementById('legalTitle');
    const scroller = ov.querySelector('.legal-body');
    const titles = { privacy: 'Política de Privacidade', terms: 'Termos de Uso' };
    let opener = null;
    function show(n) {
        title.textContent = titles[n];
        panes.forEach(p => p.hidden = p.dataset.pane !== n);
        scroller.scrollTop = 0;
    }
    function open(n, el) {
        if (!opener || !ov.contains(el)) opener = el;
        show(n);
        ov.hidden = false;
        document.body.classList.add('ov-open');
        ov.querySelector('.ov-close').focus();
    }
    function close() { ov.hidden = true; document.body.classList.remove('ov-open'); if (opener) opener.focus(); opener = null; }
    document.querySelectorAll('[data-legal]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); open(a.dataset.legal, a); }));
    ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !ov.hidden) close(); });
})();

/* ===== RESPONSIVIDADE: menu, rotação de tela e carrosséis ===== */
(function () {
    const toggle = document.getElementById('menuToggle'), menu = document.getElementById('navMenu');
    const sync = () => toggle.setAttribute('aria-expanded', menu.classList.contains('active') ? 'true' : 'false');
    const closeMenu = () => {
        if (!menu.classList.contains('active')) return;
        menu.classList.remove('active');
        const i = toggle.querySelector('i'); i.classList.remove('fa-times'); i.classList.add('fa-bars');
        document.body.style.overflow = '';
    };
    new MutationObserver(sync).observe(menu, { attributes: true, attributeFilter: ['class'] });
    sync();
    // Ao girar o aparelho ou redimensionar para o layout desktop, o menu fecha e a rolagem é liberada
    const wide = window.matchMedia('(min-width: 1151px)');
    const onWide = e => { if (e.matches) closeMenu(); };
    if (wide.addEventListener) wide.addEventListener('change', onWide); else wide.addListener(onWide);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('active')) { closeMenu(); toggle.focus(); } });
    // Recalcula os indicadores dos carrosséis ao girar/redimensionar
    let t;
    window.addEventListener('resize', () => {
        clearTimeout(t);
        t = setTimeout(() => document.querySelectorAll('.g-grid, .v-grid').forEach(c => c.dispatchEvent(new Event('scroll'))), 150);
    }, { passive: true });
})();

/* Esconde o "voltar ao topo" no celular quando o rodapé inferior está na tela */
(function () {
    const fb = document.querySelector('.footer-bottom'), btt = document.getElementById('backToTop');
    if (!fb || !btt || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(es => es.forEach(e => btt.classList.toggle('at-footer', e.isIntersecting))).observe(fb);
})();


/* ===== CARREGAMENTO SUAVE DAS IMAGENS (galeria e blog) ===== */
(function () {
    const SEL = '.g-item img, .b-img img';
    document.documentElement.classList.add('img-fade');

    // Só mostra a imagem depois de decodificada: evita o efeito "metade carregada" durante o scroll
    const reveal = img => {
        if (img.dataset.watch) return;
        img.dataset.watch = '1';
        const show = () => img.classList.add('is-loaded');
        const ready = () => (img.decode ? img.decode().then(show, show) : show());
        if (img.complete && img.naturalWidth) ready();
        else img.addEventListener('load', ready, { once: true });
    };
    document.querySelectorAll(SEL).forEach(reveal);

    // Começa a baixar antes de a seção entrar na tela (inclui os slides do carrossel mobile)
    const warm = el => el.querySelectorAll(SEL).forEach(i => { i.loading = 'eager'; });
    const sections = document.querySelectorAll('#galeria, #blog');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(es => es.forEach(e => {
            if (e.isIntersecting) { warm(e.target); io.unobserve(e.target); }
        }), { rootMargin: '900px 0px' });
        sections.forEach(x => io.observe(x));
    } else {
        sections.forEach(warm);
    }
})();

window.addEventListener("load", () => {
    const body = document.body;
    const loader = document.getElementById("introLoader");
    const barWrap = document.getElementById("introBarWrap");
    const barFill = document.getElementById("introBarFill");
    const introLogo = document.getElementById("introLogo");

    if (!loader || !barWrap || !barFill || !introLogo) return;

    introLogo.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    setTimeout(() => {
        body.classList.add("intro-logo-visible");
        }, 200);

    setTimeout(() => {
        body.classList.add("intro-step-1");

        setTimeout(() => {
        barWrap.classList.add("is-visible");

        requestAnimationFrame(() => {
            barFill.style.width = "100%";
        });

        setTimeout(() => {
            body.classList.add("intro-step-2");

            setTimeout(() => {
            loader.classList.add("is-hidden");
            body.classList.add("intro-done");
            body.classList.remove("intro-active", "intro-step-1", "intro-step-2");
            }, 900);
        }, 2200);
        }, 350);
    }, 2400);
    });
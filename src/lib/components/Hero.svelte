<script lang="ts">
    import { onMount } from "svelte";
    // import { gsap } from "gsap/dist/gsap";
    // import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

    // gsap.registerPlugin(ScrollTrigger);

    let hero: HTMLDivElement;
    onMount(()=>{

        //text intro animation
        // let tl = gsap.timeline(),
        //   mySplitText = new SplitText(hero.querySelector('h1'), {
        //       type: "words,chars",
        //   }),
        //   chars = mySplitText.chars; //an array of all the divs that wrap each character

        // gsap.set(hero.querySelector('h1'),hero.querySelector('p'), { perspective: 400 });

        // tl.from(chars, {duration: 0.8, opacity:0, rotationX:20, y:400,  ease:"back", stagger: 0.05}, "+=0");
        // tl.from(
        //   chars,
        //   {
        //       delay: 0.5,
        //       duration: 0.2,
        //       textShadow: "0px 5px 0px #130900",
        //       y: 50,
        //       opacity: 0,
        //       ease: "expo",
        //       stagger: 0.05,
        //   },
        //   "+=0"
        // );
        // tl.to(
        //   chars,
        //   {
        //       duration: 0.8,
        //       textShadow: "0px 14px 0px #130900",
        //       y: 10,
        //       ease: "back",
        //       stagger: 0.05,
        //   },
        //   "-=0"
        // );
        // tl.from(
        //   "#hero p",
        //   { duration: 2, ease: "expo", y: 30, opacity: 0 },
        //   "-=1"
        // );

        return {

        };
    });
</script>

<section id="hero" bind:this={hero}>
    <div class="header"></div>
    <h1>LangX<br /></h1>
    <p>
        <u
        >The innovative 'Learn to Earn' Token Project by
            <a href="http://langx.io" target="_blank" rel="noopener noreferrer"
            >LangX</a
            >
            <br /><br
            /></u>
        <a
                class="button mobile linkButton"
                href="https://docs.langx.io"
        >Litepaper</a
        >
    </p>

    <!-- SVG Filter used for the text effect -->
    <svg
            xmlns="http://www.w3.org/2000/svg"
            width="200"
            height="0"
            viewBox="0 0 220 0"
    >
        <filter id="displacementFilter">
            <feTurbulence
                    type="turbulence"
                    baseFrequency="5"
                    numOctaves="1"
                    result="turbulence"
            ></feTurbulence>
            <feDisplacementMap
                    in2="turbulence"
                    in="SourceGraphic"
                    scale="3"
                    xChannelSelector="R"
                    yChannelSelector="G"
            ></feDisplacementMap>
        </filter>
    </svg>

    <div class="button" id="downArrow">
        <img src="images/arrow.png" />
    </div>
</section>
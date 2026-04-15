import { colors, fonts } from "../../../design/tokens";
import { Button }        from "../../../components/Button";
import { PolaroidCard }  from "../../../components/PolaroidCard";
import { useCtaUpload }  from "../../../hooks/useCtaUpload";
import { celebImg, userImg } from "../../../assets/manifest";

const GALLERY = [
  { n: "Michael B. Jordan", p: 94, c: colors.blue,   r: -3, user: userImg("user1"), celeb: celebImg("michael_jordan") },
  { n: "Lisa – BLACKPINK",  p: 96, c: colors.pink,   r: 4,  user: userImg("user2"), celeb: celebImg("lisa")           },
  { n: "Timothée Chalamet", p: 93, c: colors.purple, r: -2, user: userImg("user3"), celeb: celebImg("timothee")       },
  { n: "Taylor Swift",      p: 97, c: colors.yellow, r: 5,  user: userImg("user4"), celeb: celebImg("taylor")         },
  { n: "Henry Cavill",      p: 91, c: colors.cyan,   r: 3,  user: userImg("user5"), celeb: celebImg("henry")          },
  { n: "Billie Eilish",     p: 89, c: colors.green,  r: -4, user: userImg("user3"), celeb: celebImg("billie")         },
  { n: "Selena Gomez",      p: 92, c: colors.pink,   r: 2,  user: userImg("user2"), celeb: celebImg("selena")         },
  { n: "Harry Styles",      p: 88, c: colors.blue,   r: -5, user: userImg("user1"), celeb: celebImg("harry")          },
];

export function Gallery() {
  const { triggerUpload, inputProps } = useCtaUpload();

  return (
    <section id="results" style={{ background: colors.black, padding: "90px 24px", position: "relative" }}>
      <input {...inputProps} />
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontFamily: fonts.display, fontSize: "clamp(36px, 5vw, 54px)", fontWeight: 700, color: colors.yellow, textShadow: `3px 3px 0 ${colors.blue}` }}>
            Real Results, Real People
          </h2>
          <p style={{ fontFamily: fonts.body, color: "rgba(255,255,255,0.5)", marginTop: 8, fontSize: 14 }}>
            See what our users discovered about their celebrity Doppelganger
          </p>
        </div>
        <div className="gallery-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, maxWidth: 860, margin: "0 auto" }}>
          {GALLERY.map((c, i) => (
            <PolaroidCard key={i} name={c.n} pct={c.p} color={c.c} rotation={c.r} delay={i * 0.2} userImg={c.user} celebImg={c.celeb} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 44 }}>
          <Button size="lg" onClick={triggerUpload}>Find My Doppelganger</Button>
        </div>
      </div>
    </section>
  );
}

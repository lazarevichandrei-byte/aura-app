"use client";

import { MEET_CATEGORIES } from "../../lib/meet/categories";
import {useI18n} from "../I18nProvider";
import type {TranslationKey} from "../../lib/i18n/dictionary";

type Props = {
  open: boolean;
  selected: string;
  onClose: () => void;
  onSelect: (id: string) => void;
};

export default function CategorySheet({
  open,
  selected,
  onClose,
  onSelect
}: Props) {
  const {t}=useI18n();

  if (!open) return null;

  return (

    <>

      <div

        onClick={onClose}

        style={{

          position:"fixed",
          inset:0,

          background:"rgba(0,0,0,.35)",

          zIndex:999

        }}

      />

      <div

        style={{

          position:"fixed",

          left:0,
          right:0,
          bottom:0,

          zIndex:1000,

          background:"var(--sheet-bg)",
          color:"var(--text-primary)",

          borderTopLeftRadius:28,
          borderTopRightRadius:28,

          padding:"20px",

          maxHeight:"70vh",

          overflowY:"auto"

        }}

      >

        <div

          style={{

            width:42,
            height:5,

            background:"#D9DEE8",

            borderRadius:999,

            margin:"0 auto 18px"

          }}

        />

        <div

          style={{

            fontSize:20,
            fontWeight:700,

            marginBottom:18

          }}

        >
          {t("category.choose")}
        </div>

        {MEET_CATEGORIES.map(item=>(

          <div

            key={item.id}

            onClick={()=>{

              onSelect(item.id);

              onClose();

            }}

            style={{

              display:"flex",

              justifyContent:"space-between",

              alignItems:"center",

              padding:"15px 16px",

              borderRadius:16,

              cursor:"pointer",

              marginBottom:8,

              background:
                selected===item.id
                ? "var(--primary-soft)"
                : "var(--surface-secondary)"

            }}

          >

            <div
              style={{
                fontSize:16
              }}
            >
              {item.icon} {t(item.translationKey as TranslationKey)}
            </div>

            {selected===item.id && (

              <div
                style={{
                  color:"var(--brand-primary)",
                  fontWeight:700
                }}
              >
                ✓
              </div>

            )}

          </div>

        ))}

      </div>

    </>

  );

}

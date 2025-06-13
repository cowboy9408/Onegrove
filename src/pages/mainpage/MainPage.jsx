import Section from "@/components/layout/Section";
import Tabs, { TabPanel } from "@/components/layout/Tabs";
import { useEffect, useState } from "react";
import KeyVisualForm from "./components/KeyVisualForm";
import WhatsOnForm from "./components/WhatsOnForm";
import LifestyleForm from "./components/LifestyleForm";
import WorkForm from "./components/WorkForm";
import EtcContentForm from "./components/EtcContentForm";
import WhatsonContent from "./components/WhatsonContent";
import { useForm, FormProvider } from "react-hook-form";

export default function MainPage() {
  const [keyVisual, setKeyVisual] = useState([]);
  const [whatsOn, setWhatsOn] = useState({});
  const [lifestyle, setLifestyle] = useState({});
  const [work, setWork] = useState({});
  const [etc, setEtc] = useState([]);
  const methods = useForm({
    defaultValues: {
      contents: [
        {
          ids: [],
          selectedTitles: "",
          uploadFile: null,
        },
      ],
    },
  });

  useEffect(() => {
    // TODO: fetch data
    setKeyVisual([
      { type: "image", title: "title1", subtitle: "subtitle1" },
      { type: "image", title: "title2", subtitle: "subtitle2" },
    ]);

    setWhatsOn({
      subtitle: "subtitle",
      type: "image",
      image: { name: "", url: "", size: 0 },
      url: "http://www.onegrove.kr",
    });

    setLifestyle({
      subtitle1: "subtitle1",
      subtitle2: "subtitle2",
      brand: [],
    });

    setWork({
      subtitle1: "subtitle1",
      subtitle2: "subtitle2",
      file: [
        { name: "", url: "", size: 0 },
        { name: "", url: "", size: 0 },
        { name: "", url: "", size: 0 },
      ],
    });

    setEtc([
      {
        type: "complex",
        imagePC: { name: "", url: "", size: 0 },
        imageMO: { name: "", url: "", size: 0 },
        title: "title",
        subtitle: "subtitle",
        detail: "detail",
        button: "button",
        url: "https://www.onegrove.kr",
      },
    ]);
  }, []);

  return (
    <FormProvider {...methods}>
      <Section>
        <Tabs
          tabs={[
            { key: "kr", label: "국문" },
            { key: "en", label: "영문" },
          ]}
        >
          <TabPanel>
            {/* 국문 폼 */}
            <KeyVisualForm data={keyVisual} />
            <WhatsOnForm data={whatsOn} />
            <WhatsonContent />
            <LifestyleForm data={lifestyle} />
            <WorkForm data={work} />
            <EtcContentForm data={etc} />
          </TabPanel>

          <TabPanel>
            {/* 영문 폼 */}
            <KeyVisualForm data={keyVisual} />
            <WhatsOnForm data={whatsOn} />
            <WhatsonContent />
            <LifestyleForm data={lifestyle} />
            <WorkForm data={work} />
            <EtcContentForm data={etc} />
          </TabPanel>
        </Tabs>
      </Section>
    </FormProvider>
  );
}

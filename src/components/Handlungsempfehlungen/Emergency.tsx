import React from "react";
// import { useTranslations } from "next-intl";
import TextBlock from "../TextBlock";
/* import { Button, Image } from "berlin-ui-library";
import Link from "next/link"; */

const Emergency: React.FC = () => {
	// const t = useTranslations();
	return (
		<div className="flex flex-col gap-12">
			<section className="">
				<TextBlock
					desktopColSpans={{ col1: 2, col2: 3 }}
					className="w-full gap-6"
					reverseDesktopColumns={true}
					slotA={
						<div className="flex w-full flex-col gap-6">
							<h3 className="">NOTFALL!</h3>
						</div>
					}
					slotB={<></>}
				/>
			</section>
		</div>
	);
};

export default Emergency;

import React from "react";

interface IframeComponentProps {
	url: string;
	height?: string;
}

const IframeComponent: React.FC<IframeComponentProps> = ({ url, height }) => {
	if (!url) {
		return null;
	}
	return (
		<div className={`${height || "h-120"} w-full`}>
			<iframe src={url} className="h-full w-full" title="Embedded Content" />
		</div>
	);
};

export default IframeComponent;

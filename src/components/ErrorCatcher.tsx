import React from "react";
import { ErrorBoundary } from "react-error-boundary";

interface ErrorCatcherProps {
	children: React.ReactNode;
	name: string;
}

const ErrorCatcher: React.FC<ErrorCatcherProps> = ({ children, name }) => {
	return (
		<ErrorBoundary
			fallbackRender={({ error }) => {
				const message = error instanceof Error ? error.message : String(error);
				const stack = error instanceof Error ? error.stack : undefined;

				return (
					<div className="bg-red overflow-hidden whitespace-pre-wrap p-12 text-white">
						<h1>--- Error in Component ---</h1>
						<p>
							<strong>Component:</strong> {name}
						</p>
						<p>
							<strong>Message:</strong> {message}
						</p>
						{stack && (
							<>
								<p>
									<strong>Stack:</strong>
								</p>
								<pre>{stack}</pre>
							</>
						)}
					</div>
				);
			}}
		>
			{children}
		</ErrorBoundary>
	);
};

export default ErrorCatcher;

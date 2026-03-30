import { useCallback } from 'react';
import { useDaily } from '@daily-co/daily-react';

export const useCVICall = () => {
	const daily = useDaily();

	const joinCall = useCallback(
		({ url, token }) => {
			daily?.join({
				url,
				token: token || undefined,
				inputSettings: {
					audio: {
						processor: {
							type: 'noise-cancellation',
						},
					},
				},
			});
		},
		[daily]
	);

	const leaveCall = useCallback(() => {
		daily?.leave();
	}, [daily]);

	return { joinCall, leaveCall };
};

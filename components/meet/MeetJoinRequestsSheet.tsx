"use client";

import BottomSheet from "../BottomSheet";
import MeetJoinRequestCard, { type MeetJoinRequest } from "./MeetJoinRequestCard";

type Props = {
  open: boolean;
  requests: MeetJoinRequest[];
  processingId: string | null;
  onClose: () => void;
  onApprove: (request: MeetJoinRequest) => void;
  onReject: (request: MeetJoinRequest) => void;
};

export default function MeetJoinRequestsSheet({ open, requests, processingId, onClose, onApprove, onReject }: Props) {
  return (
    <BottomSheet open={open} onClose={onClose} height="min(76dvh, 680px)">
      <div style={{ fontSize: 21, fontWeight: 700 }}>Заявки · {requests.length}</div>
      <div style={{ marginTop: 4, marginBottom: 16, color: "#7A8699", fontSize: 13 }}>Ожидают решения организатора</div>
      <div style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain", paddingBottom: 12 }}>
        {requests.map((request) => (
          <MeetJoinRequestCard
            key={request.id}
            request={request}
            compact
            processing={processingId === request.id}
            onApprove={() => onApprove(request)}
            onReject={() => onReject(request)}
          />
        ))}
      </div>
    </BottomSheet>
  );
}

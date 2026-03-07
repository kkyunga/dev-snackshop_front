import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axios";

const QUERY_KEY = (serverId) => ["inspect-schedules", serverId];

const fetchSchedules = (serverId) =>
  api.get(`/api/inspectSchedules/server/${serverId}`).then((r) => r.data);

const createSchedule = (body) =>
  api.post("/api/inspectSchedules", body).then((r) => r.data);

const updateSchedule = ({ id, body }) =>
  api.put(`/api/inspectSchedules/${id}`, body).then((r) => r.data);

const patchStatus = ({ id, status }) =>
  api.patch(`/api/inspectSchedules/${id}/status`, { status }).then((r) => r.data);

const deleteSchedule = (id) =>
  api.delete(`/api/inspectSchedules/${id}`).then((r) => r.data);

export const useInspectSchedules = (serverId) =>
  useQuery({
    queryKey: QUERY_KEY(serverId),
    queryFn: () => fetchSchedules(serverId),
    enabled: !!serverId,
  });

const invalidate = (qc, serverId) => qc.invalidateQueries({ queryKey: QUERY_KEY(serverId) });

export const useCreateSchedule = (serverId) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createSchedule, onSuccess: () => invalidate(qc, serverId) });
};

export const useUpdateSchedule = (serverId) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: updateSchedule, onSuccess: () => invalidate(qc, serverId) });
};

export const usePatchScheduleStatus = (serverId) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: patchStatus, onSuccess: () => invalidate(qc, serverId) });
};

export const useDeleteSchedule = (serverId) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deleteSchedule, onSuccess: () => invalidate(qc, serverId) });
};

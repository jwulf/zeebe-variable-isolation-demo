import { BpmnParser, ZBClient } from "zeebe-node-0.17a";
export async function test(bpmnFile: string) {
  const zbc = new ZBClient("localhost:26500");
  await zbc.deployWorkflow(bpmnFile, { redeploy: false });

  // Parse the process id from the bpmn file
  const pid = (BpmnParser.parseBpmn(bpmnFile) as any)[0]["bpmn:definitions"][
    "bpmn:process"
  ]["attr"]["@_id"];

  const worker = zbc.createWorker(
    "test",
    "config-to-payload",
    (job, complete) => {
      complete(job.customHeaders);
    }
  );

  const outputWorker = zbc.createWorker("test", "output", (job, complete) => {
    console.log("output", job.variables);
    complete(job.variables);
  });

  await zbc.createWorkflowInstance(pid, {});
}

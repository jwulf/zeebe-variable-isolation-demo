import { BpmnParser, ZBClient } from "zeebe-node-0.17a";
const zbc = new ZBClient("localhost:26500");

test("./bpmn/test-scoped.bpmn");

export async function test(bpmnFile: string) {
  const processId = await deployWorkflow(bpmnFile);
  if (createWorkers()) {
    await zbc.createWorkflowInstance(processId, { initial: "C" });
  }
}

async function deployWorkflow(bpmnFile: string) {
  await zbc.deployWorkflow(bpmnFile, { redeploy: true });

  // Parse the process id from the bpmn file
  const pid: string = (BpmnParser.parseBpmn(bpmnFile) as any)[0][
    "bpmn:definitions"
  ]["bpmn:process"]["attr"]["@_id"];
  return pid;
}

function createWorkers() {
  const worker = zbc.createWorker(
    "test",
    "config-to-payload",
    (job, complete) => {
      console.log(job.customHeaders);
      complete({
        taskname: job.customHeaders.taskA || job.customHeaders.taskB
      });
    }
  );

  const outputWorker = zbc.createWorker("test", "output", (job, complete) => {
    console.log("output", job.variables);
    complete(job.variables);
  });

  return { worker, outputWorker };
}

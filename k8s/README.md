# Kubernetes demo stack

This folder runs:

- 2 Node.js apps on ports `8081` and `8082`
- MongoDB as an internal-only service
- Redis as an internal-only service

## Build the Node image

```bash
cd /Users/sandiptoroy/Desktop/GS/k8s/node-server
docker build -t node-server:latest .
```

## Apply the Kubernetes manifests

```bash
cd /Users/sandiptoroy/Desktop/GS/k8s
kubectl apply -f nginx-deployment.yml
```

### Load-balanced single app

Use this file when you want one Node app running on multiple pods with one Service doing the load balancing:

```bash
kubectl apply -f node-load-balance.yml
```

This exposes the app on NodePort `30091`.

This manifest assumes the internal `mongo` and `redis` services already exist in the cluster.

### Two apps with one entry point

Use this file when you want both Node apps behind one Ingress:

```bash
kubectl apply -f node-ingress.yml
```

For Minikube, enable the ingress addon first:

```bash
minikube addons enable ingress
```

Then map a host entry such as `node.local` to your Minikube IP, or use `minikube tunnel` depending on your setup.

## Check pods and services

```bash
kubectl get pods
kubectl get svc
```

## Access the Node apps from outside the cluster

The Node services are `NodePort` services:

- app 1: `http://<node-ip>:30081`
- app 2: `http://<node-ip>:30082`

If you apply `node-load-balance.yml`, use:

- load-balanced app: `http://<node-ip>:30091`

If you apply `node-ingress.yml`, use:

- `http://node.local/app1`
- `http://node.local/app2`

If you are using minikube or kind, you may need to use the node IP or port-forward depending on your setup.

## Internal network for Mongo and Redis

MongoDB and Redis are exposed only as `ClusterIP` services:

- Mongo service name: `mongo`
- Redis service name: `redis`

Inside the cluster, the Node app connects by DNS name:

- Mongo: `mongodb://mongo:27017`
- Redis: `redis://redis:6379`

That means the apps can talk to Mongo and Redis inside the cluster without exposing those ports to the outside world.

## Test the apps

Open these URLs after deployment:

- `http://<node-ip>:30081/health`
- `http://<node-ip>:30082/health`
- `http://<node-ip>:30081/`
- `http://<node-ip>:30082/`
# Kubernetes Deployment Guide for Punju University

## Overview

This directory contains all Kubernetes manifests for deploying the Punju University School Management System on a Kubernetes cluster.

## Files Structure

- `namespace.yaml` - Kubernetes namespace definition
- `configmap.yaml` - Configuration data for applications
- `secrets.yaml` - Sensitive data (JWT secret, database credentials)
- `storage.yaml` - PersistentVolume and PersistentVolumeClaim for MongoDB
- `mongodb.yaml` - MongoDB database deployment and service
- `backend.yaml` - Backend API deployment and service
- `frontend.yaml` - Frontend application deployment and service
- `ingress.yaml` - Ingress configuration for external access
- `autoscaling.yaml` - Horizontal Pod Autoscaler configurations
- `network-policies.yaml` - Network security policies
- `pod-disruption-budget.yaml` - Pod Disruption Budget for high availability
- `resource-quota.yaml` - Resource quotas and limits
- `rbac.yaml` - Role-based access control configurations

## Prerequisites

1. **Kubernetes Cluster** (v1.21 or higher)
   - Minikube, Kind, EKS, GKE, AKS, or self-managed cluster

2. **kubectl** - Kubernetes command-line tool
   ```bash
   # Check kubectl installation
   kubectl version --client
   ```

3. **Helm** (optional, for advanced deployments)
   ```bash
   helm version
   ```

4. **Ingress Controller** (for external access)
   - NGINX Ingress Controller recommended
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.5.1/deploy/static/provider/cloud/deploy.yaml
   ```

5. **Container Images** (pre-built and pushed to registry)
   - `punju/backend:latest`
   - `punju/frontend:latest`
   - `mongo:latest` (from Docker Hub)

## Deployment Steps

### 1. Prepare Environment

```bash
# Set your context
kubectl config use-context <your-cluster>

# Verify cluster connection
kubectl cluster-info
kubectl get nodes
```

### 2. Build and Push Docker Images

Before deploying to Kubernetes, build and push your images to a registry:

```bash
# Build backend image
cd backend
docker build -t punju/backend:latest .
docker push punju/backend:latest

# Build frontend image
cd ../frontend
docker build -t punju/frontend:latest .
docker push punju/frontend:latest
```

### 3. Deploy to Kubernetes

**Option A: Deploy all at once**
```bash
# Create all resources
kubectl apply -f k8s/

# Wait for deployment to complete
kubectl wait --for=condition=available --timeout=300s deployment -l app=backend,app=frontend,app=mongodb -n punju-university
```

**Option B: Deploy step by step**
```bash
# 1. Create namespace
kubectl apply -f k8s/namespace.yaml

# 2. Create secrets and config
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml

# 3. Create storage
kubectl apply -f k8s/storage.yaml

# 4. Deploy MongoDB
kubectl apply -f k8s/mongodb.yaml
kubectl wait --for=condition=ready pod -l app=mongodb -n punju-university --timeout=300s

# 5. Deploy backend
kubectl apply -f k8s/backend.yaml
kubectl wait --for=condition=ready pod -l app=backend -n punju-university --timeout=300s

# 6. Deploy frontend
kubectl apply -f k8s/frontend.yaml
kubectl wait --for=condition=ready pod -l app=frontend -n punju-university --timeout=300s

# 7. Create Ingress and other resources
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/autoscaling.yaml
kubectl apply -f k8s/network-policies.yaml
kubectl apply -f k8s/pod-disruption-budget.yaml
kubectl apply -f k8s/resource-quota.yaml
kubectl apply -f k8s/rbac.yaml
```

### 4. Verify Deployment

```bash
# Check namespace
kubectl get namespace punju-university

# Check deployments
kubectl get deployments -n punju-university
kubectl describe deployment backend -n punju-university

# Check pods
kubectl get pods -n punju-university
kubectl describe pod <pod-name> -n punju-university

# Check services
kubectl get services -n punju-university

# Check ingress
kubectl get ingress -n punju-university
kubectl describe ingress punju-ingress -n punju-university

# Check persistent volumes
kubectl get pvc -n punju-university
kubectl get pv
```

### 5. Access the Application

**Using Ingress (Recommended)**
```bash
# Get ingress IP/hostname
kubectl get ingress -n punju-university

# Add to /etc/hosts (Linux/macOS) or C:\Windows\System32\drivers\etc\hosts (Windows)
<INGRESS_IP> punju.local

# Access in browser
http://punju.local
```

**Using NodePort (Alternative)**
```bash
# Get node port
kubectl get services -n punju-university

# Access using node IP
http://<NODE_IP>:30080   # Frontend
http://<NODE_IP>:30001   # Backend API
```

**Using Port Forwarding (Development)**
```bash
# Forward frontend
kubectl port-forward -n punju-university svc/frontend 3000:80

# Forward backend
kubectl port-forward -n punju-university svc/backend 3001:3001

# Forward MongoDB
kubectl port-forward -n punju-university svc/mongodb 27017:27017
```

## Configuration Management

### Update Secrets

```bash
# Edit secret
kubectl edit secret backend-secret -n punju-university

# Or create new secret
kubectl create secret generic backend-secret \
  --from-literal=JWT_SECRET=<new-value> \
  -n punju-university --dry-run=client -o yaml | kubectl apply -f -
```

### Update ConfigMap

```bash
# Edit configmap
kubectl edit configmap backend-config -n punju-university

# Restart deployment to apply changes
kubectl rollout restart deployment backend -n punju-university
```

## Monitoring and Logs

### View Logs

```bash
# View logs from specific pod
kubectl logs <pod-name> -n punju-university

# View logs from all backend pods
kubectl logs -f -n punju-university -l app=backend

# View logs from specific container
kubectl logs <pod-name> -c <container-name> -n punju-university
```

### Pod Debugging

```bash
# Execute command in pod
kubectl exec -it <pod-name> -n punju-university -- /bin/bash

# Check pod resources
kubectl top pods -n punju-university

# Describe pod
kubectl describe pod <pod-name> -n punju-university
```

### Events

```bash
# View cluster events
kubectl get events -n punju-university

# Watch events
kubectl get events -n punju-university --watch
```

## Scaling

### Manual Scaling

```bash
# Scale backend deployment
kubectl scale deployment backend --replicas=3 -n punju-university

# Scale frontend deployment
kubectl scale deployment frontend --replicas=3 -n punju-university
```

### Autoscaling (Already configured)

```bash
# View HPA status
kubectl get hpa -n punju-university
kubectl describe hpa backend-hpa -n punju-university

# Watch HPA activity
kubectl get hpa -n punju-university --watch
```

## Updates and Rollbacks

### Update Image

```bash
# Update backend image
kubectl set image deployment/backend backend=punju/backend:v2 -n punju-university

# Check rollout status
kubectl rollout status deployment/backend -n punju-university
```

### Rollback Deployment

```bash
# View rollout history
kubectl rollout history deployment backend -n punju-university

# Rollback to previous version
kubectl rollout undo deployment backend -n punju-university

# Rollback to specific revision
kubectl rollout undo deployment backend --to-revision=2 -n punju-university
```

## Cleanup

### Delete All Resources

```bash
# Delete all resources in namespace (keeps namespace)
kubectl delete all --all -n punju-university

# Delete entire namespace (deletes all resources including namespace)
kubectl delete namespace punju-university

# Delete specific resource
kubectl delete deployment backend -n punju-university
kubectl delete service backend -n punju-university
```

## Advanced Topics

### Persistent Data

MongoDB data is persisted in a PersistentVolume. To backup:

```bash
# Create backup
kubectl exec -n punju-university mongodb-<pod-id> -- mongodump --archive=/tmp/backup.archive
kubectl cp punju-university/mongodb-<pod-id>:/tmp/backup.archive ./backup.archive
```

### Network Policies

Network policies restrict traffic between pods. Verify they're working:

```bash
# List network policies
kubectl get networkpolicy -n punju-university

# Describe policy
kubectl describe networkpolicy backend-network-policy -n punju-university
```

### Resource Quotas

```bash
# Check quota usage
kubectl describe resourcequota punju-quota -n punju-university

# View quota limits
kubectl get resourcequota -n punju-university -o yaml
```

## Troubleshooting

### Pods not starting

```bash
# Check pod status
kubectl get pods -n punju-university

# Describe problem pod
kubectl describe pod <pod-name> -n punju-university

# View pod logs
kubectl logs <pod-name> -n punju-university
```

### Image pull errors

```bash
# Verify image exists in registry
docker pull punju/backend:latest

# Check image pull policy
kubectl get pod <pod-name> -n punju-university -o yaml | grep imagePullPolicy
```

### Database connection issues

```bash
# Test MongoDB connectivity
kubectl exec -n punju-university -it <backend-pod> -- nc -zv mongodb 27017

# Check MongoDB logs
kubectl logs -n punju-university -l app=mongodb
```

### Ingress not working

```bash
# Verify ingress controller
kubectl get pods -n ingress-nginx

# Check ingress status
kubectl get ingress -n punju-university -o wide

# Test backend service
kubectl port-forward -n punju-university svc/backend 3001:3001
curl http://localhost:3001/api/health
```

## Performance Tuning

### Adjust Resource Limits

Edit `k8s/backend.yaml` and `k8s/frontend.yaml`:

```yaml
resources:
  requests:
    memory: "512Mi"    # Increase as needed
    cpu: "200m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

Then apply changes:

```bash
kubectl apply -f k8s/backend.yaml
kubectl rollout restart deployment backend -n punju-university
```

### Adjust HPA Thresholds

Edit `k8s/autoscaling.yaml` to change CPU/memory thresholds:

```yaml
metrics:
- type: Resource
  resource:
    name: cpu
    target:
      type: Utilization
      averageUtilization: 70   # Lower = more aggressive scaling
```

## Security Best Practices

1. **Enable RBAC** - Already configured in `rbac.yaml`
2. **Use Network Policies** - Already configured in `network-policies.yaml`
3. **Pod Security Policies** - Configure in your cluster
4. **Secret Management** - Use external secret management (Vault, AWS Secrets Manager, etc.)
5. **Image Scanning** - Scan images for vulnerabilities before deployment
6. **Regular Updates** - Keep cluster and images updated

## Further Reading

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Best Practices](https://kubernetes.io/docs/concepts/configuration/overview/)

## Support

For issues or questions:
1. Check logs: `kubectl logs -f <pod> -n punju-university`
2. Describe resources: `kubectl describe pod <pod> -n punju-university`
3. Check events: `kubectl get events -n punju-university`

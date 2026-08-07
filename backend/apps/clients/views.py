from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Client
from .serializers import ClientSerializer


class ClientViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ClientSerializer
    queryset = Client.objects.all()

    def get_queryset(self):
        return self.queryset.filter(freelancer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(freelancer=self.request.user)
